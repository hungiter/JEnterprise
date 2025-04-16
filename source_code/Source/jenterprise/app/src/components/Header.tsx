import { Link } from "react-router-dom";
export default function Header() {
    return (
        <nav className="bg-white shadow-md p-4 flex justify-between">
            <Link to="/" className="text-xl font-bold text-black">travel✿com.vn</Link>
            <div>
                <Link to="/tours" className="px-4 text-black">Du lịch trong nước</Link>
                <Link to="/contact" className="px-4 text-black">Liên hệ</Link>
            </div>
        </nav>
    )
};