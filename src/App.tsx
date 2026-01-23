import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Login } from './pages/Login';
import { Cart } from './pages/Cart';
import { MyPage } from './pages/MyPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SavedPage } from './pages/SavedPage';
import { StylePage } from './pages/StylePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/style" element={<StylePage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
