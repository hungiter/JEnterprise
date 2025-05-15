import { Link } from "react-router-dom";
import type { TourSummary } from '@/src/dtos/tour.dto';
import { Card, CardContent } from "@/src/components/ui/card";

const SimilarTourCard = ({ tour }: { tour: TourSummary }) => {
    return (
        <div className="relative group w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">

            {/* Background Image */}
            <img
                src={tour.thumbnail}
                alt={tour.title}
                className="w-full h-56 object-cover transition-transform group-hover:scale-105"
            />

            {/* Always-visible title (top overlay, max 2 lines) */}
            <div className="absolute inset-0 right-0 z-10 bg-gradient-to-b from-black via-black/40 pb-[40px] to-transparent flex flex-col group-hover:opacity-0 transition-opacity duration-300 text-white px-2">
                {/* Title */}
                <div className="p-2 flex-1 overflow-y-auto pr-1 text-sm space-y-2">
                    <p className="text-sm font-semibold line-clamp-2">{tour.title}</p>
                </div>

                {/* Bottom Fixed Info */}
                <Card className="container my-2 bg-white/60">
                    <CardContent className="p-2 text-sm flex flex-col justify-between shrink-0">
                        <p><strong>Khởi hành: <span className="font-semibold text-blue-700">{tour.departure}</span></strong></p>
                        <p><strong>Mã chương trình: <span className="font-semibold">{tour.tour_code}({tour.duration})</span></strong> </p>
                    </CardContent>
                </Card>
                {/* <div className="p-2 border-t  border-gray-300 text-sm  flex flex-col justify-between mt-4 shrink-0">
                    <p><strong>Khởi hành: <span className="font-semibold text-blue-700">{tour.departure}</span></strong></p>
                    <p><strong>Mã chương trình: <span className="font-semibold">{tour.tour_code}({tour.duration})</span></strong> </p>
                </div> */}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-white/90 pb-[40px] to-transparent flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                {/* Scrollable Info */}
                <div className="p-2 flex-1 overflow-y-auto pr-1 text-sm text-gray-800 space-y-2">
                    <p className="font-bold text-">Chương trình({tour.tour_code}): <span className="text-gray-600 font-normal">{tour.title}</span></p>
                    {/* You can add more scrollable content here if needed */}
                </div>

                {/* Bottom Fixed Info */}
                <div className="p-2 border-t border-gray-300 text-sm text-gray-700 flex justify-between mt-4 shrink-0">
                    <span><strong>Thời gian:</strong> {tour.duration}</span>
                    <span><strong>Phương tiện:</strong> {tour.vehicle}</span>
                </div>
            </div>

            {/* Bottom Panel (Always visible) */}
            <div className="h-[40px] bg-white px-4 py-3 flex justify-between items-center border-t relative z-20">
                <div className="text-red-600 font-bold text-lg">
                    Giá từ <span className="text-xl">{tour.price}</span>
                </div>
                <Link to={`/tours/${tour.tour_code}`}>
                    <div className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                        Xem chi tiết →
                    </div>
                </Link>
            </div>
        </div>
    );
};
export default SimilarTourCard;


