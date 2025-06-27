import type { ScheduleInfo } from "@/src/dtos/tour.dto";
import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaUtensils } from "react-icons/fa";
const TourItinerary = ({ itinerary }: { itinerary?: ScheduleInfo[] }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!itinerary || itinerary.length === 0) {
    return <p className="text-gray-500 italic">Chưa có lịch trình cụ thể.</p>;
  }


  return (
    <div className="space-y-4 w-full">
      {itinerary.map((item) => {
        const isOpen = openIndexes.includes(item.index);
        return (
          <div key={item.index} className="bg-gray-100 shadow p-4 rounded-lg w-full">
            <button
              onClick={() => toggleIndex(item.index)}
              className="flex justify-between items-center w-full text-left"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-blue-600">
                  {item.date_label}: {item.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative w-6 h-6">
                    <div className="absolute w-6 h-6 border rounded-full border-black"></div>
                    <FaUtensils className="absolute top-1 left-1 w-4 h-4 text-gray-600 z-10" />
                  </div>
                  <div className="text-xs font-semibold">{item.meal_info}</div>
                </div>
              </div>
              <div className="ml-4 mt-1">
                {isOpen ? (
                  <FaChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <FaChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </button>
            {isOpen && (
              <div
                className="bg-white mt-4 p-4 text-sm text-gray-700 transition-all duration-200"
                dangerouslySetInnerHTML={{ __html: item.detail_html }}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TourItinerary;