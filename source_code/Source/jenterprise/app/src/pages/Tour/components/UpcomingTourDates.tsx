import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";

const getShortDay = (date: Date) => {
    const weekday = date.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    return weekday === 0 ? "CN" : `T${weekday + 1}`;
};

const UpcomingTourDates = ({ dates }: { dates: string[] }) => {
    const today = new Date();

    const upcoming = dates
        .map(date => new Date(date))
        .filter(date => date >= today)
        .sort((a, b) => a.getTime() - b.getTime());

    if (upcoming.length === 0) {
        return <p className="text-gray-500 italic">Chưa có ngày khởi hành sắp tới.</p>;
    }

    const year = format(upcoming[0], "yyyy");

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">📅 Ngày khởi hành sắp tới</h3>
            <div className="overflow-x-auto">
                <div className="flex gap-2 items-start py-2">
                    {/* Year Box */}
                    <div className="min-w-[60px] px-3 py-4 bg-blue-100 text-blue-700 font-bold text-center rounded-lg shadow">
                        {year}
                    </div>

                    {/* Date Boxes */}
                    {upcoming.map((date, idx) => (
                        <div
                            key={idx}
                            className="min-w-[80px] px-3 py-2 bg-white border border-gray-200 rounded-lg shadow text-center flex flex-col justify-center"
                        >
                            <div className="text-blue-600 text-sm font-semibold">
                                {getShortDay(date)}
                            </div>
                            <div className="text-gray-800 text-sm font-bold">
                                {format(date, "dd/MM")}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UpcomingTourDates;