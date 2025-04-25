import { Card, CardContent } from "../ui/card";
import { Section } from "../ui/section";
import { companyInfo } from "@/src/services/data";

const PersonalDataPolicy = () => {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 text-black">
            <h1 className="text-3xl font-bold mb-4">Chính sách bảo vệ dữ liệu cá nhân</h1>

            <Card>
                <CardContent className="space-y-4 p-6">
                    <Section title="Tổng quan">
                        <p>
                            {companyInfo.name} (“chúng tôi”) cam kết tôn trọng quyền riêng tư của Quý khách hàng. Chính sách này nêu rõ việc thu thập, xử lý và sử dụng dữ liệu cá nhân khi sử dụng các trang web của chúng tôi.
                        </p>
                        <p>
                            Bằng việc đồng ý với chính sách, Quý khách hàng cho phép chúng tôi xử lý dữ liệu cá nhân của mình theo quy định hiện hành.
                        </p>
                        <p>
                            Dữ liệu có thể được lưu trữ và xử lý tại Việt Nam hoặc các quốc gia khác. Việc truy cập website đồng nghĩa với việc đồng ý chuyển dữ liệu ra khỏi quốc gia của Quý khách.
                        </p>
                    </Section>

                    <Section title="Các loại dữ liệu cá nhân và cách thu thập">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Họ tên, ngày sinh, giới tính, địa chỉ, quốc tịch, hình ảnh, số điện thoại, email</li>
                            <li>Thông tin tài khoản, lịch sử hoạt động, dữ liệu định danh cá nhân</li>
                            <li>Dữ liệu nhạy cảm như sức khỏe, công việc, mối quan hệ (nếu cần)</li>
                        </ul>
                        <p>
                            Nếu cung cấp thông tin bên thứ ba, Quý khách xác nhận đã có sự đồng ý của họ.
                        </p>
                    </Section>

                    <Section title="Lưu trữ và mục đích xử lý">
                        <p>Chúng tôi lưu trữ dữ liệu để thực hiện các mục đích sau:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Xác thực, định danh người dùng</li>
                            <li>Thông báo, gửi thông tin quảng bá sản phẩm/dịch vụ</li>
                            <li>Hỗ trợ khách hàng khi sử dụng dịch vụ</li>
                            <li>Gửi dữ liệu cho đối tác, cơ quan chức năng khi cần thiết</li>
                            <li>Thực hiện xuất hóa đơn, cung cấp dịch vụ theo hợp đồng</li>
                        </ul>
                    </Section>

                    <Section title="Tiết lộ và tiếp cận dữ liệu cá nhân">
                        <p>
                            Dữ liệu có thể được tiết lộ cho các bên thứ ba (đối tác, cơ quan nhà nước...) để phục vụ mục đích được nêu rõ.
                        </p>
                        <p>
                            Dữ liệu được xử lý bởi nhân viên {companyInfo.name}, công ty con/liên kết, đối tác được thuê/hợp tác.
                        </p>
                    </Section>

                    <Section title="Chuyển dữ liệu ra nước ngoài & Phương thức xử lý">
                        <p>
                            Dữ liệu có thể được chuyển ra nước ngoài nếu cần thiết. Phương thức xử lý bao gồm lưu trữ, mã hóa, chia sẻ, xóa, sử dụng qua không gian mạng và thiết bị điện tử.
                        </p>
                    </Section>

                    <Section title="Thời gian và công cụ chỉnh sửa dữ liệu">
                        <p>
                            Chúng tôi xử lý dữ liệu từ khi được cung cấp đến khi có yêu cầu chấm dứt từ cơ quan có thẩm quyền. Quý khách có thể yêu cầu chỉnh sửa qua email: {companyInfo.email} hoặc SĐT: {companyInfo.phone}.
                        </p>
                    </Section>

                    <Section title="Rủi ro và biện pháp bảo vệ">
                        <p>
                            Dù áp dụng nhiều biện pháp bảo mật, vẫn có rủi ro bị rò rỉ dữ liệu. {companyInfo.name} không chịu trách nhiệm với các thiệt hại ngoài ý muốn.
                        </p>
                    </Section>

                    <Section title="Thông tin liên hệ">
                        <p>
                            {companyInfo.name}<br />
                            Địa chỉ: {companyInfo.address}<br />
                            Email: {companyInfo.email} | SĐT: {companyInfo.phone}
                        </p>
                    </Section>
                </CardContent>
            </Card>
        </div>
    );
};

export default PersonalDataPolicy;