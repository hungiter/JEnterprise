import { Link } from "react-router-dom";
import type { TourSummary } from '@/src/dtos/tour.dto'
import { format } from "date-fns";
import { useTour } from '@/src/context/TourContext';

const getShortDay = (date: Date) => {
  const weekday = date.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
  return weekday === 0 ? "CN" : `T${weekday + 1}`;
};

export default function TourCard({ tour }: { tour: TourSummary }) {
  const { selectedDepartureDate } = useTour();

  // Tìm ngày khởi hành phù hợp
  const today = new Date();
  const upcoming = tour.calendar
    .map(date => new Date(date))
    .filter(date => date >= today)
    .sort((a, b) => a.getTime() - b.getTime());

  let displayDate: Date | null = null;

  if (selectedDepartureDate) {
    // Nếu có filter ngày, tìm ngày trùng khớp
    const filterDate = new Date(selectedDepartureDate);
    filterDate.setHours(0, 0, 0, 0);

    displayDate = upcoming.find(date => {
      const tourDate = new Date(date);
      tourDate.setHours(0, 0, 0, 0);
      return tourDate.getTime() === filterDate.getTime();
    }) || null;
  } else {
    // Nếu không có filter, hiển thị ngày gần nhất
    displayDate = upcoming.length > 0 ? upcoming[0] : null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={tour.thumbnail}
          alt={tour.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-lg">
            {tour.tour_code}
          </span>
        </div>

        {/* Tags Section */}
        {tour.tag && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
              {tour.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {tour.title}
        </h3>

        {/* Tour Info */}
        <div className="space-y-3 mb-4">
          {/* Departure Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Khởi hành từ: <span className="font-medium text-gray-800">{tour.departure}</span></span>
          </div>

          {/* Duration Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thời gian tour:
            <span className="font-medium text-gray-800">
              {tour.duration}
            </span>
          </div>

          {/* Departure Date */}
          {displayDate ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                Ngày khởi hành: <span className="font-medium text-gray-800">
                  {getShortDay(displayDate)} {format(displayDate, "dd/MM/yyyy")}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="italic">Chưa có ngày khởi hành sắp tới</span>
            </div>
          )}
        </div>

        {/* Price Section - Moved to bottom for better UX */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Giá từ</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-red-600">
                  {tour.price}
                </span>
                <span className="text-sm text-gray-500">/người</span>
              </div>
            </div>
            <Link to={`/tours/${tour.tour_code}`}>
              <button className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
                Xem chi tiết
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}