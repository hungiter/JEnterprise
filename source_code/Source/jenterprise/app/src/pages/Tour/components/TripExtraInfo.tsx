import {
    FaMapMarkerAlt,
    FaUtensils,
    FaUsers,
    FaClock,
    FaBusAlt,
    FaTag
} from "react-icons/fa";

const iconMap: Record<string, React.ReactNode> = {
    location: <FaMapMarkerAlt className="text-blue-600 text-2xl" />,
    food: <FaUtensils className="text-blue-600 text-2xl" />,
    people: <FaUsers className="text-blue-600 text-2xl" />,
    time: <FaClock className="text-blue-600 text-2xl" />,
    transport: <FaBusAlt className="text-blue-600 text-2xl" />,
    discount: <FaTag className="text-blue-600 text-2xl" />
};

type ExtraInfoItem = {
    icon: string;
    title: string;
    desc: string;
};

const TripExtraInfo = ({ info }: { info: ExtraInfoItem[] }) => {
    return (
        <div className="bg-white mt-6 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-center mb-6">THÔNG TIN THÊM VỀ CHUYẾN ĐI</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {info.map((item, idx) => (
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