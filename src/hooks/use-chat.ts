'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Client,
  type IMessage,
  type IStompSocket,
  type StompSubscription,
} from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import axiosInstance from "../api/axios";

function resolveWsHttpBaseUrl(): string {
  const raw =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_BACKEND_CHAT as string | undefined) ||
    "";

  if (!raw) return "";
  const base = raw.trim();

  if (base.startsWith("/")) return "";
  if (!(base.startsWith("http://") || base.startsWith("https://"))) return "";
  return base.replace(/\/+$/, "");
}

/** =========================
 *  Types
 *  ========================= */

export type MessageStatus = "NORMAL" | "BLINDED" | "DELETED" | string;

export interface ChatMessage {
  messageId: number;
  userId: number;
  content: string;
  createdAt: string;
  nickname?: string;
  messageStatus: MessageStatus;
}

export interface ChatRoomEnterResponseDto {
  chatRoomId: number;
  subscribeTopic: string;
  userId: number; // ✅ enter에서 내려주는 내 userId
}

export interface ChatMessageHistoryResponseDto {
  roomId: number;
  messages: ChatMessage[];
  nextCursorMessageId: number | null;
  hasNext: boolean;
}

// ✅ 서버 WS 이벤트 타입
export type ChatEventType = "CHAT_MESSAGE" | "MESSAGE_BLINDED" | "MESSAGE_DELETED";

// ✅ 서버 WS 이벤트 payload 타입(명시)
export type ChatMessageBlindedPayload = {
  roomId: number;
  chatMessageId: number;
  blindedAt: string; // LocalDateTime은 JSON으로 문자열로 옴
};

export type ChatMessageDeletedPayload = {
  roomId: number;
  messageId: number;
};

// ✅ 서버 WS Envelope 타입
export type ChatEventEnvelope =
  | { type: "CHAT_MESSAGE"; data: unknown }
  | { type: "MESSAGE_BLINDED"; data: ChatMessageBlindedPayload }
  | { type: "MESSAGE_DELETED"; data: ChatMessageDeletedPayload };

/** =========================
 *  JSON parse helpers
 *  ========================= */
type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getNumber(obj: UnknownRecord, key: string): number | undefined {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
}

function getString(obj: UnknownRecord, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function safeJson(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch (e: unknown) {
    console.error("WS JSON parse error:", e);
    return null;
  }
}

function parseWsChatMessage(payload: unknown): ChatMessage | null {
  if (!isRecord(payload)) return null;

  const messageId = getNumber(payload, "messageId") ?? getNumber(payload, "id");
  const userId = getNumber(payload, "userId") ?? getNumber(payload, "senderId");
  const content = getString(payload, "content");
  const createdAt = getString(payload, "createdAt");
  const nickname = getString(payload, "nickname");

  const messageStatus =
    getString(payload, "messageStatus") ??
    getString(payload, "status") ??
    "NORMAL";

  if (messageId === undefined || userId === undefined || !content || !createdAt) {
    return null;
  }

  return { messageId, userId, content, createdAt, nickname, messageStatus };
}

function isEnvelope(raw: unknown): raw is { type: unknown; data: unknown } {
  return isRecord(raw) && "type" in raw && "data" in raw;
}

function isBlindedPayload(data: unknown): data is ChatMessageBlindedPayload {
  if (!isRecord(data)) return false;
  return typeof data.roomId === "number"
    && typeof data.chatMessageId === "number"
    && typeof data.blindedAt === "string";
}

function isDeletedPayload(data: unknown): data is ChatMessageDeletedPayload {
  if (!isRecord(data)) return false;
  return typeof data.roomId === "number"
    && typeof data.messageId === "number";
}

/** =========================
 *  REST API
 *  ========================= */
export async function enterChatRoom(brandId: number): Promise<ChatRoomEnterResponseDto> {
  const response = await axiosInstance.post(`/api/v1/chat/enter?brandId=${brandId}`);
  return response.data.data;
}

export async function getChatHistory(
  roomId: number,
  nextCursorMessageId?: number
): Promise<ChatMessageHistoryResponseDto> {
  const params = new URLSearchParams({ roomId: String(roomId) });

  if (nextCursorMessageId !== undefined && nextCursorMessageId !== null) {
    params.append("nextCursorMessageId", String(nextCursorMessageId));
  }

  const response = await axiosInstance.get(`/api/v1/chat/history?${params.toString()}`);
  return response.data.data;
}

export async function reportMessage(chatMessageId: number, reportReason: string): Promise<void> {
  await axiosInstance.post("/api/v1/chat/report", { chatMessageId, reportReason });
}

// ✅ 삭제 엔드포인트 확정: /api/v1/delete/{id}
export async function deleteMessage(chatMessageId: number): Promise<void> {
  await axiosInstance.delete(`/api/v1/delete/${chatMessageId}`);
}

/** =========================
 *  WebSocket Hook
 *  ========================= */
export function useChatWebSocket(chatRoomId: number | null, subscribeTopic: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const seenMessageIdsRef = useRef<Set<number>>(new Set());

  const roomIdRef = useRef<number | null>(null);
  const topicRef = useRef<string | null>(null);

  useEffect(() => { roomIdRef.current = chatRoomId; }, [chatRoomId]);
  useEffect(() => { topicRef.current = subscribeTopic; }, [subscribeTopic]);

  const disconnectTransportOnly = useCallback(() => {
    try {
      subscriptionRef.current?.unsubscribe();
    } catch (e: unknown) {
      console.debug("[WS] unsubscribe ignored", e);
    }
    subscriptionRef.current = null;

    const client = clientRef.current;
    if (client) {
      try {
        client.deactivate();
      } catch (e: unknown) {
        console.debug("[WS] deactivate ignored", e);
      }
      clientRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const resetMessages = useCallback(() => {
    seenMessageIdsRef.current = new Set();
    setMessages([]);
  }, []);

  const setMessagesFromHistory = useCallback((list: ChatMessage[]) => {
    const seen = new Set<number>();
    for (const m of list) seen.add(m.messageId);
    seenMessageIdsRef.current = seen;
    setMessages(list);
  }, []);

  // ✅ A안: messageStatus만 업데이트
  const updateMessageStatus = useCallback((messageId: number, status: MessageStatus) => {
    setMessages(prev =>
      prev.map(m => (m.messageId === messageId ? { ...m, messageStatus: status } : m))
    );
  }, []);

  const connect = useCallback(() => {
    const rid = roomIdRef.current;
    const topic = topicRef.current;
    if (!rid || !topic) return;

    const httpBaseUrl = resolveWsHttpBaseUrl();
    if (!httpBaseUrl) {
      console.error("WS 연결 실패: VITE_API_BASE_URL 같은 절대 URL이 필요합니다.");
      return;
    }

    const sockJsUrl = `${httpBaseUrl}/ws/chat`;
    const token =
      (typeof window !== "undefined" && localStorage.getItem("accessToken")) || "";

    const client = new Client({
      webSocketFactory: (): IStompSocket =>
        new SockJS(sockJsUrl) as unknown as IStompSocket,

      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,

      onConnect: () => {
        setIsConnected(true);

        try {
          subscriptionRef.current?.unsubscribe();
        } catch (e: unknown) {
          console.debug("[WS] unsubscribe ignored", e);
        }
        subscriptionRef.current = null;

        subscriptionRef.current = client.subscribe(topic, (frame: IMessage) => {
          const raw = safeJson(frame.body);

          // ✅ Envelope 처리
          if (isEnvelope(raw)) {
            const type = raw.type;

            if (type === "MESSAGE_BLINDED" && isBlindedPayload(raw.data)) {
              updateMessageStatus(raw.data.chatMessageId, "BLINDED");
              return;
            }

            if (type === "MESSAGE_DELETED" && isDeletedPayload(raw.data)) {
              updateMessageStatus(raw.data.messageId, "DELETED");
              return;
            }

            if (type === "CHAT_MESSAGE") {
              const msg = parseWsChatMessage(raw.data);
              if (!msg) return;

              if (seenMessageIdsRef.current.has(msg.messageId)) return;
              seenMessageIdsRef.current.add(msg.messageId);

              setMessages(prev => [...prev, msg]);
              return;
            }
          }

          // (옵션) envelope 없이 바로 메시지 오는 경우 대비
          const msg = parseWsChatMessage(raw);
          if (!msg) return;

          if (seenMessageIdsRef.current.has(msg.messageId)) return;
          seenMessageIdsRef.current.add(msg.messageId);

          setMessages(prev => [...prev, msg]);
        });
      },

      onWebSocketClose: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
        setIsConnected(false);
      },
      onWebSocketError: (e: unknown) => {
        console.error("WebSocket error:", e);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [updateMessageStatus]);

  const sendMessage = useCallback((content: string) => {
    const client = clientRef.current;
    const rid = roomIdRef.current;
    if (!client || !client.connected || !rid) return;

    client.publish({
      destination: "/app/message",
      body: JSON.stringify({ roomId: rid, content }),
    });
  }, []);

  useEffect(() => {
    if (chatRoomId && subscribeTopic) connect();
    return () => disconnectTransportOnly();
  }, [chatRoomId, subscribeTopic, connect, disconnectTransportOnly]);

  return {
    messages,
    setMessages,
    setMessagesFromHistory,
    resetMessages,
    isConnected,
    sendMessage,
    disconnect: disconnectTransportOnly,
    updateMessageStatus,
  };
}
