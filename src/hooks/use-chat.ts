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

/**
 * ✅ SockJS는 http/https 기반 URL만 허용
 * - 우선순위: VITE_API_BASE_URL > VITE_API_URL > VITE_BACKEND_CHAT
 * - 상대경로("/") 차단
 * - ws://, wss:// 차단
 */
function resolveWsHttpBaseUrl(): string {
  const base =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_BACKEND_CHAT as string | undefined) ||
    "";

  if (!base) return "";

  // proxy용 상대경로는 WS에 부적합
  if (base.startsWith("/")) return "";

  // SockJS는 http/https만
  if (!(base.startsWith("http://") || base.startsWith("https://"))) return "";

  // trailing slash 제거
  return base.replace(/\/+$/, "");
}

/** =========================
 *  Types (백엔드 DTO 기준)
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
  subscribeTopic: string; // 예: "/topic/chatroom/1"
}

export interface ChatMessageHistoryResponseDto {
  roomId: number;
  messages: ChatMessage[];
  nextCursorMessageId: number | null;
  hasNext: boolean;
}

/** =========================
 *  JSON 파싱 유틸 (any 금지)
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

  if (
    messageId === undefined ||
    userId === undefined ||
    content === undefined ||
    createdAt === undefined
  ) {
    return null;
  }

  return { messageId, userId, content, isBlinded, createdAt, nickname };
}

/** =========================
 *  REST API
 *  ========================= */

export async function enterChatRoom(
  brandId: number
): Promise<ChatRoomEnterResponseDto> {
  const response = await axiosInstance.post(`/api/v1/chat/enter?brandId=${brandId}`);
  return response.data.data;
}

export async function getChatHistory(
  roomId: number,
  cursorMessageId?: number
): Promise<ChatMessageHistoryResponseDto> {
  const params = new URLSearchParams({ roomId: String(roomId) });

  if (cursorMessageId !== undefined && cursorMessageId !== null) {
    params.append("cursorMessageId", String(cursorMessageId));
  }

  const response = await axiosInstance.get(`/api/v1/chat/history?${params}`);
  return response.data.data;
}

export async function reportMessage(
  chatMessageId: number,
  reportReason: string
): Promise<void> {
  await axiosInstance.post("/api/v1/chat/report", { chatMessageId, reportReason });
}

/** =========================
 *  WebSocket(STOMP + SockJS) Hook
 *  ========================= */

export function useChatWebSocket(
  chatRoomId: number | null,
  subscribeTopic: string | null
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    const client = clientRef.current;
    if (client) {
      client.deactivate();
      clientRef.current = null;
    }

    setIsConnected(false);
    setMessages([]);
  }, []);

  const connect = useCallback(() => {
    if (!chatRoomId || !subscribeTopic) return;

    const httpBaseUrl = resolveWsHttpBaseUrl();
    if (!httpBaseUrl) {
      console.error(
        "WS 연결 실패: VITE_API_BASE_URL / VITE_API_URL / VITE_BACKEND_CHAT 중 하나에 " +
          "https://도메인 형태의 절대 URL이 필요합니다."
      );
      return;
    }

    // ✅ SockJS는 http/https 엔드포인트로 접속 (내부에서 ws/wss 업그레이드)
    const sockJsUrl = `${httpBaseUrl}/ws/chat`;

    // ✅ 디버그 로그 (배포 env 반영/혼선 확인용)
    console.log("[WS ENV] VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
    console.log("[WS ENV] VITE_API_URL      =", import.meta.env.VITE_API_URL);
    console.log("[WS ENV] VITE_BACKEND_CHAT =", import.meta.env.VITE_BACKEND_CHAT);
    console.log("[WS RESOLVED] httpBaseUrl  =", httpBaseUrl);
    console.log("[WS RESOLVED] sockJsUrl    =", sockJsUrl);

    // (선택) STOMP CONNECT 인증 헤더
    const token =
      (typeof window !== "undefined" && localStorage.getItem("accessToken")) || "";

    const client = new Client({
      webSocketFactory: (): IStompSocket =>
        new SockJS(sockJsUrl) as unknown as IStompSocket,

      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},

      reconnectDelay: 3000,

      onConnect: () => {
        setIsConnected(true);

        // 중복 subscribe 방지
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        subscriptionRef.current = client.subscribe(
          subscribeTopic,
          (frame: IMessage) => {
            let parsed: unknown;
            try {
              parsed = JSON.parse(frame.body) as unknown;
            } catch (e) {
              console.error("WS JSON parse error:", e);
              return;
            }

            const msg = parseWsChatMessage(parsed);
            if (!msg) {
              console.warn("WS payload 형식이 예상과 다릅니다:", parsed);
              return;
            }

            setMessages((prev) => [...prev, msg]);
          }
        );
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
  }, [chatRoomId, subscribeTopic]);

  const sendMessage = useCallback(
    (content: string) => {
      const client = clientRef.current;
      if (!client || !client.connected || !chatRoomId) return;

      client.publish({
        destination: "/app/message",
        body: JSON.stringify({ roomId: chatRoomId, content }),
      });
    },
    [chatRoomId]
  );

  useEffect(() => {
    if (chatRoomId && subscribeTopic) connect();
    return () => disconnect();
  }, [chatRoomId, subscribeTopic, connect, disconnect]);

  return { messages, setMessages, isConnected, sendMessage, disconnect };
}
