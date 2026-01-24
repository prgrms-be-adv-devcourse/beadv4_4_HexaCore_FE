import { Outlet } from 'react-router-dom';
import { HeaderV2 } from '../components/HeaderV2';
import { Footer } from '../components/Footer';


export const MainLayout = () => {
    return (
        <div className="layout">
            <HeaderV2 />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
