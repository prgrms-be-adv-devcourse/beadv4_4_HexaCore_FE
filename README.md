# RESELLO Front-end

## 개발 서버 켜는 법(로컬)

- node.js가 설치되어 있어야 합니다.
- 아래 명령어 실행 후 `localhost:5173`으로 접속 가능합니다.
- npm install은 일단 혹시 모르니 한번씩 실행 꼭 해주세요

- 사용한 프레임워크, 라이브러리, 등등..
  - React(TypeScript, Vite)
  - Tailwind CSS
  - Zustand

```bash
npm install
npm run dev
```

### 현재 사용 가능한 페이지

1. 메인
2. 상품
   1. 상품 상세 보기
3. 스타일
4. 관심 상품 보기 (Zustand 사용함)
5. 알림창
6. 마이페이지
   1. 프로필 정보
   2. 구매 내역
   3. 판매 내역
   4. 배송 내역
   5. 예치금 관리
   6. 설정(알림 설정 등 여기서 하면 좋을 듯)
   7. 로그아웃
7. 장바구니
8. 로그인