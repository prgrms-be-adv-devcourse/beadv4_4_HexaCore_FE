"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Flag,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  enterChatRoom,
  getChatHistory,
  reportMessage,
  useChatWebSocket,
  type ChatMessage,
} from "../hooks/use-chat";

type BrandChatRoom = { id: number; brand: string; logo: string };

const BRAND_CHATROOMS: readonly BrandChatRoom[] = [
  { id: 1, brand: "Nike", logo: "https://placehold.co/100x100/111/fff?text=NIKE" },
  { id: 2, brand: "Adidas", logo: "https://placehold.co/100x100/000/fff?text=adidas" },
  { id: 3, brand: "New Balance", logo: "https://placehold.co/100x100/CF0A2C/fff?text=NB" },
  { id: 4, brand: "Supreme", logo: "https://placehold.co/100x100/E21A1A/fff?text=Supreme" },
  { id: 5, brand: "Jordan", logo: "https://placehold.co/100x100/111/fff?text=AIR" },
  { id: 6, brand: "Asics", logo: "https://placehold.co/100x100/1E3A8A/fff?text=ASICS" },
];

// ✅ UI 라벨 ↔ 백엔드 enum 매핑
const REPORT_REASONS = [
  { label: "스팸", value: "FISHING_HARASSMENT_SPAM" },
  { label: "정보유출", value: "LEAKING_FRAUD" },
  { label: "성적인 내용", value: "PORNOGRAPHY" },
  { label: "부적절한 콘텐츠", value: "INAPPROPRIATE_CONTENT" },
  { label: "모욕", value: "INSULT" },
  { label: "광고", value: "COMMERCIAL_AD" },
  { label: "정치적 발언", value: "POLITICAL_CONTENT" },
] as const;

type ReportReasonValue = (typeof REPORT_REASONS)[number]["value"];

export const Community = () => {
  const [selectedBrand, setSelectedBrand] = useState<BrandChatRoom | null>(null);

  // ✅ enter 응답 기반 상태
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [subscribeTopic, setSubscribeTopic] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [isLoadingEnter, setIsLoadingEnter] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [reportingMessageId, setReportingMessageId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  /** ✅ 신고 모달 상태 */
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetMessageId, setReportTargetMessageId] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReportReasonValue | null>(null);

  const {
    messages,
    setMessages,
    setMessagesFromHistory,
    resetMessages,
    isConnected,
    sendMessage,
    disconnect,
  } = useChatWebSocket(chatRoomId, subscribeTopic);

  // ✅ 날짜+시간 표시 (ex. 2026.01.30 12:18)
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
  };

  // (옵션) 닉네임이 실시간 payload에 없다면 fallback 표시
  const displayName = (msg: ChatMessage) => msg.nickname ?? `User#${msg.userId}`;

  /** =========================
   *  Enter: 최근 15개만 보여주기
   *  - 서버는 30개 고정 반환
   *  - 프론트에서 15개만 slice
   *  ========================= */
  const handleEnterRoom = useCallback(async (brand: BrandChatRoom) => {
    setSelectedBrand(brand);
    setIsLoadingEnter(true);

    // ✅ 입장 시작 시 UI 상태 초기화
    resetMessages();
    setHasMore(true);
    setNextCursor(null);

    try {
      const enterRes = await enterChatRoom(brand.id); // { chatRoomId, subscribeTopic }
      setChatRoomId(enterRes.chatRoomId);
      setSubscribeTopic(enterRes.subscribeTopic);

      setIsLoadingHistory(true);
      const history = await getChatHistory(enterRes.chatRoomId);

      // 너 기존 흐름 유지: reverse해서 오래된 것부터 보이게
      const ordered = [...history.messages].reverse();

      // ✅ 최근 15개만 화면에
      const last15 = ordered.slice(Math.max(ordered.length - 15, 0));
      setMessagesFromHistory(last15);

      setHasMore(history.hasNext);
      setNextCursor(history.nextCursorMessageId);
    } catch (e) {
      console.error("Failed to enter chat room:", e);
      alert("채팅방 입장에 실패했습니다.");

      setSelectedBrand(null);
      setChatRoomId(null);
      setSubscribeTopic(null);

      resetMessages();
      setHasMore(true);
      setNextCursor(null);
    } finally {
      setIsLoadingEnter(false);
      setIsLoadingHistory(false);
    }
  }, [resetMessages, setMessagesFromHistory]);

  // Close
  const handleCloseRoom = useCallback(() => {
    disconnect();

    setSelectedBrand(null);
    setChatRoomId(null);
    setSubscribeTopic(null);

    resetMessages();
    setHasMore(true);
    setNextCursor(null);

    setReportModalOpen(false);
    setReportTargetMessageId(null);
    setSelectedReason(null);
    setMenuOpenId(null);
  }, [disconnect, resetMessages]);

  /** =========================
   *  Load more history (과거 prepend)
   *  - cursor param: nextCursorMessageId
   *  - 서버는 30개 고정 반환
   *  ========================= */
  const loadMoreHistory = useCallback(async () => {
    if (!chatRoomId || isLoadingHistory || !hasMore || !nextCursor) return;

    setIsLoadingHistory(true);
    try {
      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight ?? 0;

      const history = await getChatHistory(chatRoomId, nextCursor);

      const older = [...history.messages].reverse();
      setMessages((prev) => [...older, ...prev]);

      setHasMore(history.hasNext);
      setNextCursor(history.nextCursorMessageId);

      // 스크롤 위치 보정
      requestAnimationFrame(() => {
        if (!container) return;
        const newScrollHeight = container.scrollHeight;
        const diff = newScrollHeight - prevScrollHeight;
        container.scrollTop = container.scrollTop + diff;
      });
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [chatRoomId, isLoadingHistory, hasMore, nextCursor, setMessages]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const c = messagesContainerRef.current;
    if (!c) return;
    if (c.scrollTop === 0 && hasMore && !isLoadingHistory) loadMoreHistory();
  }, [hasMore, isLoadingHistory, loadMoreHistory]);

  // Send
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || !isConnected) return;
    sendMessage(inputValue.trim());
    setInputValue("");
  }, [inputValue, isConnected, sendMessage]);

  // Report modal open
  const openReportModal = useCallback((messageId: number) => {
    setMenuOpenId(null);
    setReportTargetMessageId(messageId);
    setSelectedReason(null);
    setReportModalOpen(true);
  }, []);

  // Report submit
  const submitReport = useCallback(async () => {
    if (!reportTargetMessageId || !selectedReason) return;

    setReportingMessageId(reportTargetMessageId);
    try {
      await reportMessage(reportTargetMessageId, selectedReason);
      alert("메시지가 신고되었습니다.");
      setReportModalOpen(false);
      setReportTargetMessageId(null);
      setSelectedReason(null);
    } catch (e) {
      console.error("Failed to report message:", e);
      alert("신고에 실패했습니다.");
    } finally {
      setReportingMessageId(null);
    }
  }, [reportTargetMessageId, selectedReason]);

  // Scroll bottom (실시간 수신 시)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 px-6 lg:px-10">
      <div className="flex gap-6">
        <div className={`flex-1 max-w-[1200px] mx-auto transition-all ${selectedBrand ? "lg:mr-[400px]" : ""}`}>
          <div className="flex flex-col mb-12">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle size={28} strokeWidth={2.5} className="text-[#333]" />
              <h2 className="text-3xl font-black text-[#333] tracking-tight">오픈채팅</h2>
            </div>
            <p className="text-gray-400 font-medium ml-[40px]">
              브랜드별 오픈채팅방에서 정보를 공유하세요
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {BRAND_CHATROOMS.map((room) => (
              <div
                key={room.id}
                className={`group bg-white rounded-2xl p-5 border border-solid shadow-sm transition-all hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 flex flex-col items-center gap-4 ${
                  selectedBrand?.id === room.id ? "border-black" : "border-gray-100"
                }`}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img src={room.logo || "/placeholder.svg"} alt={room.brand} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-base font-bold text-[#333]">{room.brand}</h3>
                <button
                  onClick={() => handleEnterRoom(room)}
                  disabled={isLoadingEnter && selectedBrand?.id === room.id}
                  className="w-full py-2.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingEnter && selectedBrand?.id === room.id ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : (
                    "입장하기"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedBrand && (
          <div className="fixed right-0 top-[120px] h-[calc(100vh-120px)] w-full max-w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.08)] z-50">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img src={selectedBrand.logo || "/placeholder.svg"} alt={selectedBrand.brand} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-[#333]">{selectedBrand.brand}</h3>
                  <p className="text-xs text-gray-400">
                    {isConnected ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        연결됨
                      </span>
                    ) : (
                      "연결 중..."
                    )}
                  </p>
                </div>
              </div>
              <button onClick={handleCloseRoom} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5 space-y-4"
            >
              {isLoadingHistory && (
                <div className="flex justify-center py-2">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              )}

              {isLoadingEnter ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={48} strokeWidth={1.5} />
                  <p className="mt-3 text-sm">아직 메시지가 없습니다</p>
                  <p className="text-xs">첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.messageId} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                      {displayName(msg)[0]?.toUpperCase() ?? "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#333]">{displayName(msg)}</span>
                        {/* ✅ 날짜+시간 표시 */}
                        <span className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <p className="text-sm text-[#555] bg-gray-50 rounded-xl px-3 py-2 inline-block break-words">
                          {msg.isBlinded ? "블라인드된 메시지입니다." : msg.content}
                        </p>

                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === msg.messageId ? null : msg.messageId)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical size={14} className="text-gray-400" />
                          </button>

                          {menuOpenId === msg.messageId && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-max">
                              <button
                                onClick={() => openReportModal(msg.messageId)}
                                disabled={reportingMessageId === msg.messageId}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50 whitespace-nowrap disabled:opacity-50"
                              >
                                {reportingMessageId === msg.messageId ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Flag size={14} />
                                )}
                                신고하기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
                  disabled={!isConnected}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!isConnected || !inputValue.trim()}
                  className="p-2 bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 신고 사유 선택 모달 */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <button
            className="absolute inset-0 bg-black/30"
            aria-label="close"
            onClick={() => {
              setReportModalOpen(false);
              setReportTargetMessageId(null);
              setSelectedReason(null);
            }}
          />

          <div className="relative w-full max-w-[360px] rounded-2xl bg-white border border-gray-200 shadow-xl p-4">
            <div className="text-base font-semibold text-[#333]">신고 사유 선택</div>
            <div className="mt-1 text-sm text-gray-500">아래 항목 중 하나를 선택해주세요.</div>

            <div className="mt-3 space-y-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedReason(r.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition-colors ${
                    selectedReason === r.value
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  setReportModalOpen(false);
                  setReportTargetMessageId(null);
                  setSelectedReason(null);
                }}
              >
                취소
              </button>

              <button
                onClick={submitReport}
                disabled={!reportTargetMessageId || !selectedReason || reportingMessageId === reportTargetMessageId}
                className="px-3 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {reportingMessageId === reportTargetMessageId ? "신고 중..." : "신고하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
