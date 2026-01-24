declare module "sockjs-client/dist/sockjs" {
    // 최소 선언: 생성자 시그니처만 대충 열어두기
    class SockJS {
      constructor(url: string, protocols?: string | string[], options?: Record<string, unknown>);
      close(code?: number, reason?: string): void;
      send(data: string): void;
      onopen: ((e: Event) => void) | null;
      onmessage: ((e: MessageEvent) => void) | null;
      onclose: ((e: CloseEvent) => void) | null;
      onerror: ((e: Event) => void) | null;
    }
    export default SockJS;
  }
  