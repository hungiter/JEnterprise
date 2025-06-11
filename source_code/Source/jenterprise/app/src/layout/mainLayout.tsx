import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import LoginRegisterModal from "../components/header/LoginRegisterModal"; // Adjust path if needed

export default function MainLayout() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header onLoginClick={() => setShowLogin(true)} />
      <div className="container mx-auto p-4 flex-grow">
        <Outlet />
      </div>
      <Footer />
      <LoginRegisterModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
