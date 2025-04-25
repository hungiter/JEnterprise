import {
    FaMapMarkerAlt,
    FaUtensils,
    FaUsers,
    FaClock,
    FaBusAlt,
    FaTag
} from "react-icons/fa";

import type { TourDetail } from "@/src/dtos/tour.dto";

const iconMap: Record<string, React.ReactNode> = {
    location: <FaMapMarkerAlt className="text-blue-600 text-2xl" />,
    food: <FaUtensils className="text-blue-600 text-2xl" />,
    people: <FaUsers className="text-blue-600 text-2xl" />,
    time: <FaClock className="text-blue-600 text-2xl" />,
    transport: <FaBusAlt className="text-blue-600 text-2xl" />,
    discount: <FaTag className="text-blue-600 text-2xl" />
};


const TripExtraInfo = ({ info }: { info: TourDetail }) => {
    const extraInfo = [
        {
            icon: "location",
            title: "Điểm tham quan",
            desc: info.sightseeing_spots
        },
        {
            icon: "food",
            title: "Ẩm thực",
            desc: info.cuisine
        },
        {
            icon: "people",
            title: "Đối tượng thích hợp",
            desc: info.suitable_customers
        },
        {
            icon: "time",
            title: "Thời gian lý tưởng",
            desc: info.ideal_times
        },
        {
            icon: "transport",
            title: "Phương tiện",
            desc: info.vehicles
        },
        {
            icon: "discount",
            title: "Khuyến mãi",
            desc: "Đã bao gồm ưu đãi trong giá tour"
        }
    ]

    return (
        <div className="bg-white mt-6 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-center mb-6">THÔNG TIN THÊM VỀ CHUYẾN ĐI</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {extraInfo.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        {iconMap[item.icon] ?? <FaMapMarkerAlt className="text-blue-600 text-2xl" />}
                        <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripExtraInfo;