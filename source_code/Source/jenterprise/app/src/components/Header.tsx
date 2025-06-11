import { Link } from "react-router-dom";

interface HeaderProps {
    onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
    return (
        <nav className="bg-white shadow-md p-4 flex justify-between">
            <Link to="/" className="text-xl font-bold text-black">travel✿com.vn</Link>
            <div>
                <Link to="/tours" className="px-4 text-black">Du lịch trong nước</Link>
                <Link to="/contact" className="px-4 text-black">Liên hệ</Link>

                <button onClick={onLoginClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded transition">
                    Đăng nhập
                </button>
            </div>
        </nav>
    )
};