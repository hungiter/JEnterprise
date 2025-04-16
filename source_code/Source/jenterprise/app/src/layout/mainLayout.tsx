import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="bg-gray-100 flex flex-col min-h-screen">
            <Header />
            <div className="container mx-auto p-4 flex-grow">
                <Outlet /> {/* Đây là nơi render các trang con */}
            </div>
            <Footer />
        </div>
    );
}