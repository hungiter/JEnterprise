import { companyInfo, provinces } from "../services/data"

export default function Footer() {
    console.log("companyInfo", companyInfo);
    console.log("provinces", provinces);
    return (
        <footer className="bg-blue-50 text-sm py-8 px-4 border-t border-gray-200 text-black">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Danh sách tỉnh thành */}
                <div>
                    <h4 className="font-semibold mb-3 text-blue-700">Du lịch trong nước</h4>
                    <ul className="grid grid-cols-2 gap-y-2">
                        {provinces.map((province, idx) => (
                            <li key={idx} className="text-gray-700">{province}</li>
                        ))}
                    </ul>
                </div>

                {/* Thông tin liên hệ */}
                <div>
                    <h4 className="font-semibold mb-3 text-blue-700">Liên hệ</h4>
                    <p>{companyInfo.address}</p>
                    <div className="mt-2 flex">
                        <p className="w-24 font-medium shrink-0">Điện thoại:</p>
                        <div className="space-y-1">
                            {companyInfo.phone.map((phone, idx) => (
                                <p key={idx}>{phone}</p>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 flex">
                        <p className="w-24 font-medium shrink-0">Email:</p>
                        <div className="space-y-1">
                            {companyInfo.email.map((email, idx) => (
                                <p key={idx}>{email}</p>
                            ))}
                        </div>
                    </div>
                    {/* <div className="flex gap-3 mt-3">
                        <a href="#"><img src="/icons/facebook.svg" alt="fb" className="w-5" /></a>
                        <a href="#"><img src="/icons/instagram.svg" alt="ig" className="w-5" /></a>
                        <a href="#"><img src="/icons/zalo.svg" alt="zalo" className="w-5" /></a>
                    </div> */}
                </div>

                {/* Thông tin khác */}
                <div>
                    <h4 className="font-semibold mb-3 text-blue-700">Thông tin</h4>
                    <ul className="space-y-1 text-gray-700">
                        <li><a href="/privacypolicy">Chính sách riêng tư</a></li>
                        <li><a href="/termofuse">Điều khoản sử dụng</a></li>
                        <li><a href="/help">Trợ giúp</a></li>
                        <li><a href="/personaldatapolicy">Chính sách bảo vệ dữ liệu cá nhân</a></li>
                    </ul>
                </div>
            </div>

            {/* Bản quyền */}
            <div className="mt-8 text-center text-gray-600 text-xs border-t border-gray-200 pt-4">
                <p>Bản quyền {companyInfo.copyright}</p>
                <p>Số giấy phép kinh doanh lữ hành Quốc tế: {companyInfo.license}.</p>
            </div>
        </footer>
    );
}