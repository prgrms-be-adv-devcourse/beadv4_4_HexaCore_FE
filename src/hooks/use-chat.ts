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
export interface ChatMessage {
  messageId: number;
  userId: number;
  content: string;
  isBlinded: boolean;
  createdAt: string;
  nickname?: string;
}

export interface ChatRoomEnterResponseDto {
  chatRoomId: number;
  subscribeTopic: string;
}

export interface ChatMessageHistoryResponseDto {
  roomId: number;
  messages: ChatMessage[];
  nextCursorMessageId: number | null;
  hasNext: boolean;
}

/** =========================
 *  JSON parse
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
function getBoolean(obj: UnknownRecord, key: string): boolean | undefined {
  const v = obj[key];
  return typeof v === "boolean" ? v : undefined;
}

function parseWsChatMessage(payload: unknown): ChatMessage | null {
  if (!isRecord(payload)) return null;

  const messageId = getNumber(payload, "messageId") ?? getNumber(payload, "id");
  const userId = getNumber(payload, "userId") ?? getNumber(payload, "senderId");
  const content = getString(payload, "content");
  const createdAt = getString(payload, "createdAt");

  const isBlinded =
    getBoolean(payload, "isBlinded") ?? getBoolean(payload, "blinded") ?? false;

  const nickname = getString(payload, "nickname");

  if (messageId === undefined || userId === undefined || !content || !createdAt) {
    return null;
  }

  return { messageId, userId, content, isBlinded, createdAt, nickname };
}

function safeJson(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch (e) {
    console.error("WS JSON parse error:", e);
    return null;
  }
}

/** =========================
 *  REST API
 *  ========================= */
export async function enterChatRoom(brandId: number): Promise<ChatRoomEnterResponseDto> {
  const response = await axiosInstance.post(`/api/v1/chat/enter?brandId=${brandId}`);
  return response.data.data;
}

/**
 * ✅ size 파라미터 없음(서버 30 고정)
 * ✅ cursor 파라미터 이름: nextCursorMessageId
 */
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
    try { subscriptionRef.current?.unsubscribe(); } catch {console.debug("[WS] unsubscribe failed (ignored):");}
    subscriptionRef.current = null;

    const client = clientRef.current;
    if (client) {
      try { client.deactivate(); } catch {console.debug("[WS] unsubscribe failed (ignored):");}
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

        try { subscriptionRef.current?.unsubscribe(); } catch {console.debug("[WS] unsubscribe failed (ignored):");}
        subscriptionRef.current = null;

        subscriptionRef.current = client.subscribe(topic, (frame: IMessage) => {
          const msg = parseWsChatMessage(safeJson(frame.body));
          if (!msg) return;

          if (seenMessageIdsRef.current.has(msg.messageId)) return;
          seenMessageIdsRef.current.add(msg.messageId);

          setMessages((prev) => [...prev, msg]);
        });
      },

      onWebSocketClose: () => setIsConnected(false),
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
        setIsConnected(false);
      },
      onWebSocketError: (e) => {
        console.error("WebSocket error:", e);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, []);

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
  };
}
