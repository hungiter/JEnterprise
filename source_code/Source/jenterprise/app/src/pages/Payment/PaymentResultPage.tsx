import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { getUserInfoFromCookie } from "@/src/context/LoginContext";
import { useEffect, useRef } from "react";
import { acceptOrder, rejectOrder } from "@/src/services/tour/TourOrderService";

const PaymentResultPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const success = searchParams.get("success") === "true";
    const instanceId = searchParams.get("tourCode") || ""; // temporaty in backend
    const userInfo = getUserInfoFromCookie();
    // If not redirect from other ngrok-free.app, redirect to access denied
    if (userInfo == null || instanceId == null || instanceId == "") {
        navigate("/tours");
        return;
    }
    const tourCode = instanceId.split("_")[0];
    const hasInitializedRef = useRef(false);

    const executeOrder = async () => {
        try {
            if (success) {
                await acceptOrder({ "instanceId": instanceId, "username": userInfo.username });
            } else {
                await rejectOrder({ "instanceId": instanceId, "username": userInfo.username });
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Load tours only once when component mounts
    useEffect(() => {
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            executeOrder();
        }
    }, []); // Empty dependency array - only run once

    // Back to tour detail page
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
                    <p className="text-sm text-gray-500">Mã tour: <span className="font-semibold">{instanceId}</span></p>
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
