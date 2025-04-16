import { Card, CardContent } from "../ui/card";
import { Section } from "../ui/section";

const TermsOfUse = () => {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 text-black">
            <h1 className="text-3xl font-bold mb-4">Thỏa thuận sử dụng</h1>

            <Card>
                <CardContent className="space-y-4 p-6">
                    <Section title="Các điều kiện & điều khoản">
                        <p>
                            Trang web này được điều hành bởi <strong>Công ty Du lịch TH Travel</strong>. Vui lòng đọc kỹ các điều kiện và điều khoản trước khi sử dụng. Bằng việc truy cập và sử dụng website, bạn đồng ý tuân thủ các điều khoản sử dụng dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng trang web.
                        </p>
                    </Section>
                    <Section title="Luật điều chỉnh">
                        <p>
                            Việc truy cập vào trang web này có điều kiện theo sự đồng ý của bạn rằng toàn bộ những thông tin trên trang web và toàn bộ các vấn đề phát sinh giữa bạn và chúng tôi sẽ được điều chỉnh bởi pháp luật Việt Nam và rằng mọi tranh chấp phát sinh giữa bạn và chúng tôi sẽ căn cứ vào quyền hạn xét xử của các tòa án Việt Nam.
                        </p>
                    </Section>
                    <Section title="Thông tin về TH Travel">
                        <p>
                            <strong>Địa chỉ:</strong> 19 Nguyễn Hữu Thọ, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh<br />
                            <strong>Điện thoại:</strong> (+84 9) 0867 0268 / (+84 9) 0800 1508<br />
                            <strong>Email:</strong> botspammer147@gmail.com / botspammer741@gmail.com
                        </p>
                    </Section>
                </CardContent>
            </Card>
        </div>
    );
};

export default TermsOfUse;
