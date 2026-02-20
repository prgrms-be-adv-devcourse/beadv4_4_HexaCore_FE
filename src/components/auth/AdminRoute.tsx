import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const AdminRoute = () => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const role = user?.role;
    const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
