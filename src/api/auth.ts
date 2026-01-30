import axiosInstance from "./axios";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store/authStore";

// 공통: 토큰 저장 및 상태 업데이트
const handleLoginSuccess = (accessToken: string) => {
  try {
    const claims = jwtDecode(accessToken);
    useAuthStore.getState().setAuth(accessToken, claims);
  } catch (error) {
    console.error("Token decoding failed:", error);
  }
};

/** TODO: 자체 로그인 도입할 경우 사용
 * 이메일(자체) 로그인
 * Spring Security의 formLogin을 사용하므로, 
 * x-www-form-urlencoded 형식으로 username, password 전송
 */
export const emailLogin = async (email: string, password: string) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const res = await axiosInstance.post("/login", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // accessToken은 Header에서 가져옴 (Bearer ...)
  const authHeader = res.headers["authorization"];
  if (authHeader) {
    const accessToken = authHeader.replace("Bearer ", "");
    handleLoginSuccess(accessToken);
    return { accessToken };
  } else {
    throw new Error("Login failed: Authentication header missing");
  }
};

/** TODO: 백엔드 로그아웃 API 확인 후 수정 필요
 * 로그아웃
 * 백엔드 로그아웃 API 호출 및 클라이언트 상태 초기화
 */
export const logout = async () => {
  try {
    // 백엔드 로그아웃 API 호출
    await axiosInstance.post("/api/v1/users/logout");
  } catch (err) {
    console.error("Logout request failed:", err);
  } finally {
    // 요청 실패 여부와 상관없이 클라이언트는 무조건 로그아웃 처리
    useAuthStore.getState().clearAuth();
  }
};

/** TODO: 자체 회원가입 도입할 경우 수정 필요
 * 회원가입
 */
export const signup = (data: any) => {
  return axiosInstance.post("/api/v1/signup", data);
};
