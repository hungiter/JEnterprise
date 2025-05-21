import { useSearchParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const success = searchParams.get("success") === "true";
    const tourCode = searchParams.get("tourCode") || "";

    const handleBackToTour = () => {
        navigate(`/tours/${tourCode}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                {success ? (
                    <div className="flex flex-col items-center gap-4">
                        <FaCheckCircle className="text-green-500 w-16 h-16" />
                        <h1 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h1>
                        <p className="text-gray-600">Bạn đã đặt tour thành công.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <FaTimesCircle className="text-red-500 w-16 h-16" />
                        <h1 className="text-2xl font-bold text-red-600">Thanh toán thất bại!</h1>
                        <p className="text-gray-600">Đã có lỗi xảy ra trong quá trình thanh toán.</p>
                    </div>
                )}

                <div className="mt-6">
                    <p className="text-sm text-gray-500">Mã tour: <span className="font-semibold">{tourCode}</span></p>
                </div>

                <button
                    onClick={handleBackToTour}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
                >
                    Quay lại trang tour
                </button>
            </div>
        </div>
    );
};

export default PaymentResultPage;
