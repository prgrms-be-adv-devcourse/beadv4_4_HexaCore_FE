'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Client,
  type IMessage,
  type IStompSocket,
  type StompSubscription,
} from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/";

/**
 * ✅ MSA + Proxy 환경 대응:
 * - REST는 VITE_API_URL='/' 로 proxy 타고,
 * - WS는 proxy가 기본적으로 안 타서 chat 서버 실제 주소를 직접 넣는 게 안전함.
 *   .env에 VITE_WS_URL을 넣어두면 그걸 쓰고,
 *   없으면 VITE_BACKEND_CHAT을 fallback으로 사용.
 */
const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_BACKEND_CHAT ||
  "";

/** =========================
 *  Types (백엔드 DTO 기준)
 *  ========================= */

export interface ChatMessage {
  messageId: number;
  userId: number;
  content: string;
  isBlinded: boolean;
  createdAt: string; // LocalDateTime 문자열
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

interface CommonResponse<T> {
  status: number;
  message: string;
  data: T;
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


/**
 * WS payload는 프로젝트마다 필드가 살짝 다를 수 있어서
 * messageId/id, isBlinded/blinded 등 변형까지 안전하게 흡수
 */
function parseWsChatMessage(payload: unknown): ChatMessage | null {
  if (!isRecord(payload)) return null;

  const messageId =
    getNumber(payload, "messageId") ??
    getNumber(payload, "id"); // 혹시 id로 오는 경우 대비

  const userId =
    getNumber(payload, "userId") ??
    getNumber(payload, "senderId"); // 혹시 senderId로 오는 경우 대비

  const content = getString(payload, "content");
  const createdAt = getString(payload, "createdAt");

  const isBlinded =
    getBoolean(payload, "isBlinded") ??
    getBoolean(payload, "blinded") ??
    false;

  const nickname = getString(payload, "nickname");

  if (messageId === undefined || userId === undefined || content === undefined || createdAt === undefined) {
    return null;
  }

  return {
    messageId,
    userId,
    content,
    isBlinded,
    createdAt,
    nickname,
  };
}

/** =========================
 *  REST API
 *  ========================= */

import axiosInstance from "../api/axios";

// Enter chat room
export async function enterChatRoom(brandId: number): Promise<ChatRoomEnterResponseDto> {
  const response = await axiosInstance.post(`/api/v1/chat/enter?brandId=${brandId}`);
  return response.data.data;
}

// Get chat history
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

// Report message (요청 DTO: chatMessageId + reportReason(enum string))
export async function reportMessage(chatMessageId: number, reportReason: string): Promise<void> {
  await axiosInstance.post("/api/v1/chat/report", {
    chatMessageId,
    reportReason,
  });
}

/** =========================
 *  WebSocket(STOMP + SockJS) Hook
 *  ========================= */

export function useChatWebSocket(chatRoomId: number | null, subscribeTopic: string | null) {
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

    if (!WS_BASE_URL) {
      console.error("VITE_WS_URL 또는 VITE_BACKEND_CHAT이 설정되어 있지 않습니다.");
      return;
    }

    const sockJsUrl = `${WS_BASE_URL}/ws/chat`;

    const client = new Client({
      webSocketFactory: (): IStompSocket => {
        // SockJS 타입과 STOMP 기대 소켓 타입이 완전 동일하지 않아 unknown 캐스팅 사용 (any 금지)
        return new SockJS(sockJsUrl) as unknown as IStompSocket;
      },
      reconnectDelay: 3000,

      onConnect: () => {
        setIsConnected(true);

        // 중복 subscribe 방지
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        subscriptionRef.current = client.subscribe(subscribeTopic, (frame: IMessage) => {
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
