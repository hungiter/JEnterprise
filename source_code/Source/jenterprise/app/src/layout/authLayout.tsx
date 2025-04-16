import {  Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function AuthLayout() {
  return (
    <div className="bg-white-100 min-h-screen">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <Outlet /> {/* Đây là nơi render các trang con */}
      </div>
    </div>
  );
}