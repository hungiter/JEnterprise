import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet, useNavigate } from "react-router-dom";
import LoginRegisterModal from "../components/header/LoginRegisterModal"; // Adjust path if needed
import { LoginProvider, useLogin } from "../context/LoginContext";
import { TagProvider } from "../context/TagContext";
import { SearchProvider } from "../context/SearchContext";
import { VnpayProvider } from "../context/VnpayContext";
import { ToastProvider } from "../context/ToastContext";
import { TourProvider } from "../context/TourContext";
import { useEffect, useState } from "react";
import { getUserInfoFromCookie } from "../context/LoginContext";

function MainLayoutContent() {
  const navigate = useNavigate();
  const { token } = useLogin();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      setIsCheckingUser(true);

      // Check if user is admin immediately without delay
      if (token) {
        const userInfo = getUserInfoFromCookie();
        if (userInfo && userInfo.role === "Admin") {
          // Redirect immediately for admin without any delay
          navigate("/admin");
          return; // Exit early, don't continue with other logic
        }
      }

      // Only show loading for non-admin users or when no token
      // Simulate a small delay to show loading screen
      await new Promise(resolve => setTimeout(resolve, 300));

      setIsCheckingUser(false);
    };

    checkUserAndRedirect();
  }, [navigate, token]);

  // Show loading screen while checking user (only for non-admin)
  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200/50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang kiểm tra thông tin tài khoản...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto p-4 flex-grow">
        <Outlet />
      </div>
      <Footer />
      <LoginRegisterModal />
    </div>
  );
}

export default function MainLayout() {
  return (
    <ToastProvider>
      <LoginProvider>
        <TagProvider>
          <SearchProvider>
            <VnpayProvider>
              <TourProvider>
                <MainLayoutContent />
              </TourProvider>
            </VnpayProvider>
          </SearchProvider>
        </TagProvider>
      </LoginProvider>
    </ToastProvider>
  );
}
