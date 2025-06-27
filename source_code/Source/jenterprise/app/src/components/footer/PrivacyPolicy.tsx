import { Card, CardContent } from "../ui/card";
import { Section } from "../ui/section";

export default function PrivacyPolicy() {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 text-black">
            <h1 className="text-3xl font-bold mb-4">Chính sách quyền riêng tư – TH Travel</h1>

            <Card>
                <CardContent className="space-y-4 p-6">
                    <Section title="Cookie & dữ liệu truy cập">
                        <p className="mb-2">
                            TH Travel sử dụng cookie trên website và ứng dụng của chúng tôi để phân tích lưu lượng truy cập và cải thiện trải nghiệm người dùng. Cookie là các tệp nhỏ được lưu trữ trên thiết bị của bạn nhằm nhận diện người dùng và lưu lại các tùy chọn cá nhân.
                        </p>
                        <p className="mb-2">
                            Chúng tôi sử dụng cookie để thu thập dữ liệu thống kê truy cập nhằm tối ưu giao diện và nội dung dịch vụ. Cookie không cho phép chúng tôi truy cập vào thông tin cá nhân của bạn trừ khi bạn chủ động cung cấp.
                        </p>
                        <p>
                            Bạn có thể từ chối cookie bằng cách điều chỉnh trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến trải nghiệm sử dụng website.
                        </p>
                    </Section>

                    <Section title="Thanh toán & bảo mật">
                        <p>
                            Mọi giao dịch thanh toán tại TH Travel đều được mã hóa SSL thông qua hệ thống bảo mật đạt chuẩn quốc tế của các đối tác như MasterCard, Visa và Vietcombank. Chúng tôi cam kết bảo mật tuyệt đối thông tin thẻ của bạn.
                        </p>
                    </Section>

                    <Section title="Thông tin cá nhân">
                        <p className="mb-2">
                            Khi bạn đăng ký, đặt tour hoặc gửi yêu cầu hỗ trợ, chúng tôi có thể thu thập các thông tin như: họ tên, giới tính, ngày sinh, email, số điện thoại, địa chỉ, sở thích...
                        </p>
                        <p className="mb-2">
                            Những thông tin này sẽ được sử dụng để:
                        </p>
                        <ul className="list-disc ml-6 mb-2 space-y-1">
                            <li>Hoàn tất đăng ký, thanh toán và đặt tour.</li>
                            <li>Gửi thông tin khuyến mãi, ưu đãi và chăm sóc khách hàng.</li>
                            <li>Cá nhân hóa nội dung website theo sở thích của bạn.</li>
                            <li>Tuân thủ các yêu cầu từ cơ quan chức năng (nếu có).</li>
                        </ul>
                        <p>
                            Chúng tôi không bán, chia sẻ hoặc cung cấp thông tin cá nhân cho bên thứ ba nếu không có sự cho phép của bạn.
                        </p>
                    </Section>

                    <Section title="Bảo mật thông tin">
                        <p>
                            TH Travel triển khai các biện pháp bảo mật nghiêm ngặt để bảo vệ dữ liệu cá nhân bao gồm tường lửa, mã hóa và kiểm soát truy cập nội bộ. Chỉ những nhân viên được phân quyền mới được tiếp cận dữ liệu này.
                        </p>
                    </Section>

                    <Section title="Xóa thông tin cá nhân">
                        <p>
                            Bạn có thể yêu cầu xóa toàn bộ dữ liệu cá nhân của mình bằng cách gửi email đến <strong>info@thtravel.vn</strong>. Thời gian xử lý yêu cầu: <strong>7 ngày làm việc</strong>.
                        </p>
                    </Section>

                    <Section title="Liên kết bên ngoài">
                        <p>
                            Website của chúng tôi có thể chứa liên kết đến các website khác. Chính sách bảo mật của TH Travel không áp dụng cho các website này. Chúng tôi khuyến nghị bạn đọc kỹ chính sách riêng tư của các trang bên ngoài trước khi cung cấp bất kỳ thông tin cá nhân nào.
                        </p>
                    </Section>

                    <Section title="Cập nhật chính sách">
                        <p>
                            TH Travel có thể cập nhật chính sách này theo thời gian để phù hợp với thay đổi pháp luật và yêu cầu bảo mật mới. Việc tiếp tục sử dụng website đồng nghĩa với việc bạn đồng ý với các thay đổi đó.
                        </p>
                    </Section>
                </CardContent>
            </Card>
        </div>
    );
}
