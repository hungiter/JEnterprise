import {
    Links,
    Meta,
    Scripts,
    ScrollRestoration,
} from "react-router";
import { BrowserRouter as Router, Route, Routes, Link, Outlet } from "react-router-dom";

const Navbar = () => (
    <nav className="bg-white shadow-md p-4 flex justify-between">
        <Link to="/" className="text-xl font-bold text-black">travel✿com.vn</Link>
        <div>
            <Link to="/tours" className="px-4 text-black">Du lịch trong nước</Link>
            <Link to="/contact" className="px-4 text-black">Liên hệ</Link>
        </div>
    </nav>
);

export default function MainLayout() {
    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div className="container mx-auto py-6 px-4">
                <Outlet /> {/* Đây là nơi render các trang con */}
            </div>
        </div>
    );
}