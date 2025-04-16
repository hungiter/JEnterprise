import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 py-12">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Trang không tồn tại</h2>
            <p className="text-gray-600 mb-6">
                Rất tiếc, chúng tôi không tìm thấy trang bạn yêu cầu.
            </p>
            <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
            >
                Quay về trang chủ
            </button>
        </div>
    );
}
