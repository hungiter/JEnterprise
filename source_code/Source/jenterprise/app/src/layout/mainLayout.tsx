import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import LoginRegisterModal from "../components/header/LoginRegisterModal"; // Adjust path if needed
import { LoginProvider } from "../context/LoginContext";
import { SearchProvider } from "../context/TagContext";
import { VnpayProvider } from "../context/VnpayContext";

export default function MainLayout() {
  return (
    <LoginProvider>
      <SearchProvider>
        <VnpayProvider>
          <div className="bg-gray-100 flex flex-col min-h-screen">
            <Header />
            <div className="container mx-auto p-4 flex-grow">
              <Outlet />
            </div>
            <Footer />
            <LoginRegisterModal />
          </div>
        </VnpayProvider>
      </SearchProvider>
    </LoginProvider>
  );
}
