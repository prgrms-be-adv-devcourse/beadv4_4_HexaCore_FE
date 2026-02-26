import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Login } from './pages/Login';
import { Cart } from './pages/Cart';
import { MyPage } from './pages/MyPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SavedPage } from './pages/SavedPage';
import { Community } from './pages/Community';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { PurchaseBiddingPage } from './pages/PurchaseBiddingPage';
import { SalesBiddingPage } from './pages/SalesBiddingPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailPage } from './pages/PaymentFailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSettlement } from './pages/admin/AdminSettlement';
import { AdminProductManagement } from "./pages/admin/AdminProductManagement";
import { AdminBrandManagement } from "./pages/admin/AdminBrandManagement";
import { AdminCategoryManagement } from "./pages/admin/AdminCategoryManagement";
import { AdminOptionManagement } from "./pages/admin/AdminOptionManagement";
import { SettlementList } from './pages/SettlementList';
import { SettlementDetail } from './pages/SettlementDetail';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ErrorPage } from './pages/ErrorPage';



import { useFcm } from './hooks/useFcm';
import { AdminProductList } from "./pages/admin/AdminProductList.tsx";
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminBidSpamLogs } from './pages/admin/AdminBidSpamLogs';

function App() {
  useFcm();
  return (
    <BrowserRouter>
      <Routes>
        {/* 소셜 로그인 Callback 라우트 */}
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />

        {/* 메인 레이아웃 적용 라우트 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/products/:id/bid" element={<PurchaseBiddingPage />} />
          <Route path="/products/:id/sell" element={<SalesBiddingPage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/mypage/settlement" element={<SettlementList />} />
          <Route path="/mypage/settlement/:settlementId" element={<SettlementDetail />} />
          <Route path="/mypage/order/:orderId" element={<OrderDetailPage />} />

          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>

        {/* Admin 레이아웃 적용 라우트 — ROLE_ADMIN 만 접근 가능 */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="settlement" element={<AdminSettlement />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="product/" element={<AdminProductManagement />} />
            <Route path="product/:productInfoId" element={<AdminProductManagement />} />
            <Route path="brands" element={<AdminBrandManagement />} />
            <Route path="categories" element={<AdminCategoryManagement />} />
            <Route path="options" element={<AdminOptionManagement />} />
            <Route path="users" element={<div className="text-center py-20 text-gray-500">회원 관리 페이지 (준비중)</div>} />
            <Route path="bid-spam-logs" element={<AdminBidSpamLogs />} />
            <Route path="settings" element={<div className="text-center py-20 text-gray-500">설정 페이지 (준비중)</div>} />
          </Route>
        </Route>

        {/* 결제 결과 페이지: 헤더/푸터 없이 독립적인 화면 구성 */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
