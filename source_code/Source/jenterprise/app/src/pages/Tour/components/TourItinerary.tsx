import type { ScheduleInfo } from "@/src/dtos/tour.dto";

  const TourItinerary = ({ itinerary }: { itinerary?: ScheduleInfo[] }) => {
    if (!itinerary || itinerary.length === 0) {
      return <p className="text-gray-500 italic">Chưa có lịch trình cụ thể.</p>;
    }
  
    return (
      <div className="space-y-4">
        {itinerary.map((item) => (
          <div key={item.index} className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-lg font-bold text-blue-600">{item.date_label}: {item.title}</h3>
            <p>{item.detail_html}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default TourItinerary;