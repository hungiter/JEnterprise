import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { useTour } from "@/src/context/TourContext";

const getShortDay = (date: Date) => {
    const weekday = date.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    return weekday === 0 ? "CN" : `T${weekday + 1}`;
};

const UpcomingTourDates = ({ dates }: { dates: string[] }) => {
    const { selectedDepartureDate, setSelectedDepartureDate } = useTour();
    const today = new Date();

    const upcoming = dates
        .map(date => new Date(date))
        .filter(date => date >= today)
        .sort((a, b) => a.getTime() - b.getTime());

    if (upcoming.length === 0) {
        return <p className="text-gray-500 italic">Chưa có ngày khởi hành sắp tới.</p>;
    }

    const year = format(upcoming[0], "yyyy");

    const handleDateSelect = (date: Date) => {
        const dateString = format(date, "yyyy-MM-dd");
        setSelectedDepartureDate(dateString);
    };

    const isDateSelected = (date: Date) => {
        if (!selectedDepartureDate) return false;
        const selectedDate = new Date(selectedDepartureDate);
        return format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
    };

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
                    {upcoming.map((date, idx) => {
                        const selected = isDateSelected(date);
                        return (
                            <div
                                key={idx}
                                onClick={() => handleDateSelect(date)}
                                className={`min-w-[80px] px-3 py-2 border rounded-lg shadow text-center flex flex-col justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                                    selected
                                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                                        : 'bg-white text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                }`}
                            >
                                <div className={`text-sm font-semibold ${
                                    selected ? 'text-white' : 'text-blue-600'
                                }`}>
                                    {getShortDay(date)}
                                </div>
                                <div className={`text-sm font-bold ${
                                    selected ? 'text-white' : 'text-gray-800'
                                }`}>
                                    {format(date, "dd/MM")}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedDepartureDate && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                        <span className="font-semibold">Đã chọn:</span> {format(new Date(selectedDepartureDate), "EEEE, dd/MM/yyyy", { locale: vi })}
                    </p>
                </div>
            )}
        </div>
    );
};

export default UpcomingTourDates;