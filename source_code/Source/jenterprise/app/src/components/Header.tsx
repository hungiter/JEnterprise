import { Link } from "react-router-dom";
import { useLogin } from "../context/LoginContext";
import { clearCookie, getCookie } from "../services/cookies/Cookies";

interface HeaderProps {
    onLoginClick?: () => void;
}

export default function Header() {
    const { showLogin, setShowLogin } = useLogin();
    const { token, setToken } = useLogin();

    const logout = async () => {
        try {
            clearCookie("accessToken")
            setToken(null)
        } catch (error) {
            console.log(error);
        } finally {
        }
    };

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between">
            <Link to="/" className="text-xl font-bold text-black">travel✿com.vn</Link>
            <div>
                <Link to="/tours" className="px-4 text-black">Du lịch trong nước</Link>
                <Link to="/contact" className="px-4 text-black">Liên hệ</Link>

                {
                    token ? (
                        <button
                            onClick={() => logout()}
                            className="bg-yellow-400 hover:bg-red-500 text-white px-4 py-1.5 rounded transition cursor-pointer"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowLogin(true)}
                            className="bg-blue-500 hover:bg-green-500 text-white px-4 py-1.5 rounded transition cursor-pointer"
                        >
                            Đăng nhập
                        </button>
                    )
                }
            </div>
        </nav>
    )
};