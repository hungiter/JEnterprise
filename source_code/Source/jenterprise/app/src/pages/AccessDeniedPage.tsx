import { useLocation, Link, useNavigate } from "react-router-dom";
import { FaLock, FaHome, FaShieldAlt, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AccessDeniedPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { from?: string; message?: string } | null;
    
    const message = state?.message || "Bạn không có quyền truy cập trang này";

    // Auto redirect if no state (user manually navigated to this page)
    useEffect(() => {
        if (!state) {
            navigate('/', { replace: true });
        }
    }, [state, navigate]);

    // Don't render anything if redirecting
    if (!state) {
        return null;
    }

    // Travel-themed icons for background
    const icons = [FaShieldAlt, FaLock, FaExclamationTriangle];
    const cellSize = 80;
    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);

    const updateGridSize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setCols(Math.ceil(w / cellSize));
        setRows(Math.ceil(h / cellSize));
    };

    useEffect(() => {
        updateGridSize();
        window.addEventListener("resize", updateGridSize);
        return () => window.removeEventListener("resize", updateGridSize);
    }, []);

    const generateRepeatingIcons = (rows: number, cols: number) => {
        const result = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const index = (r + c) % icons.length;
                const Icon = icons[index];
                result.push(
                    <Icon
                        key={`${r}-${c}`}
                        className="w-6 h-6 text-white opacity-10 animate-pulse"
                    />
                );
            }
        }
        return result;
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-300 overflow-hidden">
            {/* Grid icon background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
                    }}
                >
                    {generateRepeatingIcons(rows, cols)}
                </div>
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-md w-full mx-4"
            >
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
                    >
                        <FaLock className="w-10 h-10 text-red-600" />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-gray-900 mb-4"
                    >
                        Truy cập bị từ chối
                    </motion.h1>

                    {/* Message */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 mb-6"
                    >
                        {message}
                    </motion.p>

                    {/* Additional Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-sky-50 rounded-xl p-4 mb-6 border border-sky-200"
                    >
                        <p className="text-sm text-sky-700">
                            Nếu bạn tin rằng đây là lỗi, vui lòng liên hệ với quản trị viên.
                        </p>
                    </motion.div>

                    {/* Action Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link
                            to="/tours"
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 transform hover:scale-105"
                        >
                            <FaHome className="w-4 h-4 mr-2" />
                            Về trang chủ
                        </Link>
                    </motion.div>

                    {/* Error Code */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 pt-6 border-t border-sky-200"
                    >
                        <p className="text-xs text-sky-500">
                            Mã lỗi: 403 - Forbidden
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
} 