import HomeView from "@/components/HomeView";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    return <HomeView onNavigate={(tab) => navigate(tab === "home" ? "/" : `/${tab}`)} />;
};

export default Home;
