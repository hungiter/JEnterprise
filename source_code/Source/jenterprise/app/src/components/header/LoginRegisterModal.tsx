import React, { useEffect, useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import LoginImage from "@/src/assets/welcome_1.jpg";
import RegisterImage from "@/src/assets/welcome_2.jpg";
import { useLogin } from "@/src/context/LoginContext";
import { login } from "@/src/context/LoginContext";
import { useNavigate } from "react-router-dom";

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRegisterModal() {
  const { showLogin, setShowLogin, onProcess, setOnProcess } = useLogin();
  const { token, setToken } = useLogin();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [hasMounted, setHasMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    if (showLogin) {
      setTab("login")
      setHasMounted(true)
    };
  }, [showLogin]);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const tryLogin = async () => {
    try {
      if (!username) {
        setUsernameError("Username không được bỏ trống.")
        return
      }

      if (!password) {
        setUsernameError("Password không được bỏ trống.")
        return
      }

      setOnProcess(true);

      const loginResult = await login(username, password);
      if (loginResult.data) {
        setToken(loginResult.data?.token)
        setShowLogin(false)

        // Redirect admin to admin dashboard
        if (loginResult.data?.role === "Admin") {
          navigate("/admin");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOnProcess(false);
    }
  };

  return (
    <AnimatePresence>
      {showLogin && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowLogin(false)}
        >
          <div className="hidden md:block w-full h-full p-8">
            <motion.div
              className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateY: hasMounted ? (tab === "register" ? 180 : 0) : 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <img
                  src={LoginImage}
                  alt="Background"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${tab === "login" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                />
                <img
                  src={RegisterImage}
                  alt="Background"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity rotate-y-180 duration-1000 ${tab === "register" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                />
                <div className="absolute inset-0 bg-black/10 hover:bg-amber-50 z-10" />


                {/* Front Side - Login */}
                {/* <div className="absolute inset-0 flex justify-end items-center w-full h-full rounded-r-3xl backface-hidden transform rotate-y-0 z-20"> */}
                <div className={`absolute w-full h-full flex justify-end items-center rounded-r-3xl transition-opacity duration-1000 ${tab === "login" ? "opacity-100 z-20 pointer-events-auto" : "opacity-0 pointer-events-none z-0"
                  }`}>
                  {/* Login Form Right */}
                  <div className="w-2/3 lg:w-1/2 h-full p-6 flex flex-col justify-center bg-amber-500">
                    <h3 className="text-xl font-bold text-blue-600 text-center mb-2">
                      ✈ Chào mừng đã đến travel✿com.vn
                    </h3>
                    <p className="text-gray-500 text-center mb-4">
                      Vui lòng đăng nhập để khám phá những hành trình đáng nhớ!
                    </p>
                    <form className="space-y-5">
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          type="text"
                          placeholder="Tên tài khoản"
                          className="pl-10 pr-4 py-2 w-full rounded-lg border text-black"
                        />
                      </div>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          placeholder="Mật khẩu"
                          className="pl-10 pr-4 py-2 w-full rounded-lg border text-black"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={tryLogin}
                        disabled={onProcess}
                        className={`w-full py-2 rounded-xl text-white flex items-center justify-center gap-2 transition
        ${onProcess ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                      >
                        {onProcess && (
                          <svg
                            className="w-5 h-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                            ></path>
                          </svg>
                        )}
                        {onProcess ? "Đang đăng nhập..." : "Đăng nhập"}
                      </button>
                    </form>
                    <p className="text-md text-center mt-4 text-gray-500">
                      <span>Bạn chưa có tài khoản?</span>
                      <button
                        disabled={onProcess}
                        onClick={() => setTab("register")}
                        className={`ml-1 font-bold hover:underline ${onProcess ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-600"} `}
                      >
                        Đăng ký
                      </button>
                    </p>
                  </div>
                </div>

                {/* Back Side - Register */}
                {/* <div className="absolute inset-0 flex justify-start items-center w-full h-full rounded-l-3xl backface-hidden transform rotate-y-0 z-20"> */}
                <div className={`absolute w-full h-full flex justify-start items-center rounded-l-3xl rotate-y-180 transition-opacity duration-1000 ${tab === "register" ? "opacity-100 z-20 pointer-events-auto" : "opacity-0 pointer-events-none z-0"
                  }`}>
                  {/* Register Form Left */}
                  <div className="w-2/3 lg:w-1/2 h-full p-6 flex flex-col justify-center bg-amber-200">
                    <h3 className="text-xl font-bold text-blue-600 text-center mb-2">
                      ✈ Cùng nhau khám phá thế giới!
                    </h3>
                    <p className="text-gray-500 text-center mb-4">
                      Hãy đồng hành cùng chúng tôi để trải nghiệm những chuyến du lịch khắp năm châu!
                    </p>
                    <form className="space-y-5">
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="Địa chỉ email"
                          className="pl-10 pr-4 py-2 w-full rounded-lg border text-black"
                        />
                      </div>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-3 text-gray-400" />
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          type="text"
                          placeholder="Tên tài khoản"
                          className="pl-10 pr-4 py-2 w-full rounded-lg border text-black"
                        />
                      </div>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          placeholder="Mật khẩu"
                          className="pl-10 pr-4 py-2 w-full rounded-lg border text-black"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={tryLogin}
                        disabled={onProcess}
                        className={`w-full py-2 rounded-xl text-white flex items-center justify-center gap-2 transition
        ${onProcess ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                      >
                        {onProcess && (
                          <svg
                            className="w-5 h-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                            ></path>
                          </svg>
                        )}
                        {onProcess ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                      </button>
                    </form>
                    <p className="text-sm text-center mt-4 text-gray-500">
                      <span>Bạn đã có tài khoản?</span>
                      <button
                        onClick={() => setTab("login")}
                        className={`ml-1 font-bold hover:underline ${onProcess ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-600"} `}
                      >
                        Đăng nhập
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>


          <div className="block md:hidden p-8">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Travel-themed Banner */}
              <div className="mb-6 text-center">
                <h3 className="text-md font-bold text-blue-600 overflow-x-hidden">
                  ✈ Chào mừng đã đến travel✿com.vn
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {tab === "login"
                    ? "Vui lòng đăng nhập để khám phá những hành trình đáng nhớ!"
                    : "Hãy đồng hành cùng chúng tôi để trải nghiệm những chuyến du lịch khắp năm châu!"}
                </p>
              </div>

              {/* Tab Switch */}
              <div className="flex justify-center mb-6">
                <button
                  disabled={onProcess}
                  onClick={() => setTab("login")}
                  className={`px-4 py-2 rounded-l-xl font-semibold transition-all duration-300 ${tab === "login"
                    ? `${onProcess ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white`
                    : "bg-gray-100 text-gray-600"
                    }`}
                >
                  Login
                </button>
                <button
                  disabled={onProcess}
                  onClick={() => setTab("register")}
                  className={`px-4 py-2 rounded-r-xl font-semibold transition-all duration-300 ${tab === "register"
                    ? `${onProcess ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white`
                    : "bg-gray-100 text-gray-600"
                    }`}
                >
                  Register
                </button>
              </div>

              {/* Form */}
              <form className="space-y-5 text-black">
                {tab === "register" && (

                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Địa chỉ email"
                      className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                )}
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    placeholder="Tên tài khoản"
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Mật khẩu"
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => tab === "login" ?
                    tryLogin() : {}}
                  disabled={onProcess}
                  className={`w-full py-2 rounded-xl text-white flex items-center justify-center gap-2 transition
        ${onProcess ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                  {onProcess && (
                    <svg
                      className="w-5 h-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                      ></path>
                    </svg>
                  )}
                  {
                    onProcess ?
                      (tab === "login" ? "Đang đăng nhập..." : "Đang tạo tài khoản...")
                      : (tab === "login" ? "Đăng nhập" : "Tạo tài khoản")
                  }
                </button>
              </form>

              {/* Switch Tab */}
              <div className="text-center mt-4 text-sm text-gray-500">
                {tab === "login" ? "Bạn chưa có tài khoản?" : "Bạn đã có tài khoản?"}
                <button
                  disabled={onProcess}
                  onClick={() => setTab(tab === "login" ? "register" : "login")}
                  className={`ml-1 font-bold hover:underline ${onProcess ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-600"} `}
                >
                  {tab === "login" ? "Đăng ký" : "Đăng nhập"}
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg"
              >
                ×
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

