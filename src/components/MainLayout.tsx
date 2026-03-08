import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import DesktopNav from "./DesktopNav";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get the active tab from the pathname
    const activeTab = location.pathname === "/" ? "home" : location.pathname.substring(1);

    useEffect(() => {
        const seen = sessionStorage.getItem("intro_seen");
        if (!seen) {
            navigate("/intro");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background">
            <DesktopNav activeTab={activeTab} onTabChange={(tab) => navigate(tab === "home" ? "/" : `/${tab}`)} />
            <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                    <Outlet />
                </PageTransition>
            </AnimatePresence>
            <BottomNav activeTab={activeTab} onTabChange={(tab) => navigate(tab === "home" ? "/" : `/${tab}`)} />
        </div>
    );
};

export default MainLayout;
