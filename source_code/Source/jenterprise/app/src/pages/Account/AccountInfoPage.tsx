import { useEffect, useState } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { changePassword, type ChangePasswordRequest } from "@/src/services/user/UserInfoService";
import { getUserInfoFromCookie, useLogin } from "@/src/context/LoginContext";
import { useNavigate } from "react-router-dom";
import Loading from "@/src/components/Loading";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaHome, FaChartBar, FaCog } from "react-icons/fa";
import { clearCookie } from "@/src/services/cookies/Cookies";

export default function AccountInfo() {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [activeSection, setActiveSection] = useState<'password' | 'new-feature'>('password');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [passwordValidation, setPasswordValidation] = useState({
        currentPassword: { isValid: true, message: '' },
        newPassword: { isValid: true, message: '' },
        confirmPassword: { isValid: true, message: '' }
    });

    const { token } = useLogin();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not logged in
        if (!token) {
            navigate("/tours");
            return;
        }

        const fetchUserInfo = async () => {
            const userInfo = getUserInfoFromCookie();
            if (!userInfo || userInfo.username === "") {
                navigate("/tours");
                return;
            }

            try {
                setLoading(true);
                setUserInfo(userInfo);
            } catch (err) {
                setError("Có lỗi xảy ra khi tải thông tin tài khoản: " + err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [token, navigate]);

    const handlePasswordChange = (field: keyof ChangePasswordRequest, value: string) => {
        setPasswordForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear errors when user starts typing
        setPasswordError(null);
        setPasswordSuccess(null);

        // Clear field-specific errors
        setPasswordValidation(prev => ({
            ...prev,
            [field]: { isValid: true, message: '' }
        }));
    };

    const validatePasswordField = (field: keyof ChangePasswordRequest, value: string) => {
        let isValid = true;
        let message = '';

        switch (field) {
            case 'currentPassword':
                if (!value) {
                    isValid = false;
                    message = 'Mật khẩu hiện tại không được để trống';
                }
                break;
            case 'newPassword':
                if (!value) {
                    isValid = false;
                    message = 'Mật khẩu mới không được để trống';
                } else if (value.length < 6) {
                    isValid = false;
                    message = 'Mật khẩu mới phải có ít nhất 6 ký tự';
                } else if (value === passwordForm.currentPassword) {
                    isValid = false;
                    message = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    isValid = false;
                    message = 'Xác nhận mật khẩu không được để trống';
                } else if (value !== passwordForm.newPassword) {
                    isValid = false;
                    message = 'Xác nhận mật khẩu không khớp';
                }
                break;
        }

        setPasswordValidation(prev => ({
            ...prev,
            [field]: { isValid, message }
        }));

        return isValid;
    };

    const validateAllFields = () => {
        const currentValid = validatePasswordField('currentPassword', passwordForm.currentPassword);
        const newValid = validatePasswordField('newPassword', passwordForm.newPassword);
        const confirmValid = validatePasswordField('confirmPassword', passwordForm.confirmPassword);

        return currentValid && newValid && confirmValid;
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmitPasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        if (!validateAllFields()) {
            setPasswordError("Vui lòng kiểm tra lại thông tin nhập");
            return;
        }

        // Show confirmation dialog
        setShowConfirmDialog(true);
    };

    const confirmPasswordChange = async () => {
        setShowConfirmDialog(false);

        try {
            setIsChangingPassword(true);
            setPasswordError(null);
            setPasswordSuccess(null);

            // Clear all validation errors
            setPasswordValidation({
                currentPassword: { isValid: true, message: '' },
                newPassword: { isValid: true, message: '' },
                confirmPassword: { isValid: true, message: '' }
            });

            const response = await changePassword(passwordForm);

            if (response.success) {
                setPasswordSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.");
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswords({
                    current: false,
                    new: false,
                    confirm: false
                });

                // Auto logout after successful password change
                setTimeout(() => {
                    navigate("/tours");
                }, 3000);
            } else {
                // Handle specific field errors from backend
                if (response.oldPasswordError) {
                    setPasswordValidation(prev => ({
                        ...prev,
                        currentPassword: { isValid: false, message: response.oldPasswordError || '' }
                    }));
                }

                if (response.newPasswordError) {
                    setPasswordValidation(prev => ({
                        ...prev,
                        newPassword: { isValid: false, message: response.newPasswordError || '' }
                    }));
                }

                if (response.confirmPasswordError) {
                    setPasswordValidation(prev => ({
                        ...prev,
                        confirmPassword: { isValid: false, message: response.confirmPasswordError || '' }
                    }));
                }

                // Set general error message
                if (response.message) {
                    setPasswordError(response.message);
                } else {
                    setPasswordError("Đổi mật khẩu thất bại");
                }
            }
        } catch (err) {
            setPasswordError("Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.\n" + err);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const cancelPasswordChange = () => {
        setShowConfirmDialog(false);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center text-red-500">
                    <h2 className="text-xl font-bold mb-2">Lỗi</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!userInfo || userInfo.username === "") {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center text-gray-500">
                    <h2 className="text-xl font-bold mb-2">Không tìm thấy thông tin</h2>
                    <p>Không thể tải thông tin tài khoản</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-0">
                    {/* Left Sidebar - Account Info */}
                    <div className="lg:w-1/3 lg:pr-4">
                        <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl sticky top-4 h-fit">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
                                    <FaUser className="text-blue-600" />
                                    Thông tin tài khoản
                                </h2>

                                <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Tên đăng nhập</p>
                                        <p className="font-semibold text-gray-800">{userInfo.username}</p>
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="border-t border-gray-200 my-6"></div>

                                {/* Account Functions */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-600 mb-3">Chức năng tài khoản</h3>

                                    <button
                                        onClick={() => setActiveSection('password')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${activeSection === 'password'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <FaLock className="w-4 h-4" />
                                        Đổi mật khẩu
                                    </button>

                                    <button
                                        onClick={() => setActiveSection('new-feature')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${activeSection === 'new-feature'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <FaCog className="w-4 h-4" />
                                        Chức năng mới
                                    </button>

                                    <button
                                        onClick={() => navigate("/tours")}
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                                    >
                                        <FaHome className="w-4 h-4" />
                                        Quay lại trang chủ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Dynamic Content */}
                    <div className="lg:w-2/3 lg:pl-4">
                        {activeSection === 'password' && (
                            <Card className="shadow-lg" id="change-password-section">
                                <CardContent className="p-8">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
                                        <FaLock className="text-green-600" />
                                        Đổi mật khẩu
                                    </h2>

                                    {passwordError && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-600 text-sm">{passwordError}</p>
                                        </div>
                                    )}

                                    {passwordSuccess && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-green-600 text-sm">{passwordSuccess}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmitPasswordChange} className="space-y-6">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu hiện tại
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordValidation.currentPassword.isValid
                                                        ? 'border-gray-300'
                                                        : 'border-red-500'
                                                        }`}
                                                    placeholder="Nhập mật khẩu hiện tại"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            {!passwordValidation.currentPassword.isValid && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {passwordValidation.currentPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordValidation.newPassword.isValid
                                                        ? 'border-gray-300'
                                                        : 'border-red-500'
                                                        }`}
                                                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            {!passwordValidation.newPassword.isValid && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {passwordValidation.newPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Xác nhận mật khẩu mới
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordValidation.confirmPassword.isValid
                                                        ? 'border-gray-300'
                                                        : 'border-red-500'
                                                        }`}
                                                    placeholder="Nhập lại mật khẩu mới"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            {!passwordValidation.confirmPassword.isValid && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {passwordValidation.confirmPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className={`w-full py-4 px-6 rounded-lg font-medium transition-colors duration-200 ${isChangingPassword
                                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                        >
                                            {isChangingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                                        </button>
                                    </form>

                                    {/* Confirmation Dialog */}
                                    {showConfirmDialog && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                    Xác nhận đổi mật khẩu
                                                </h3>
                                                <p className="text-gray-600 mb-6">
                                                    Bạn có chắc chắn muốn đổi mật khẩu? Sau khi đổi mật khẩu thành công,
                                                    bạn sẽ được chuyển về trang chủ để đăng nhập lại.
                                                </p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={cancelPasswordChange}
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        onClick={confirmPasswordChange}
                                                        disabled={isChangingPassword}
                                                        className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${isChangingPassword
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                            }`}
                                                    >
                                                        {isChangingPassword ? "Đang xử lý..." : "Xác nhận"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {activeSection === 'new-feature' && (
                            <Card className="shadow-lg">
                                <CardContent className="p-8">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
                                        <FaCog className="text-orange-600" />
                                        Chức năng mới
                                    </h2>

                                    <div className="text-center py-12">
                                        <div className="mb-6">
                                            <FaCog className="text-6xl text-orange-400 mx-auto mb-4 animate-spin" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                                            Đang trong quá trình phát triển
                                        </h3>
                                        <p className="text-gray-500 text-lg max-w-md mx-auto">
                                            Chức năng này đang được chúng tôi phát triển và sẽ sớm ra mắt.
                                            Hãy quay lại sau để trải nghiệm những tính năng mới!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}