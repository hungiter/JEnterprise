type ItineraryItem = {
    day: number;
    title: string;
    description: string;
  };
  
  const TourItinerary = ({ itinerary }: { itinerary?: ItineraryItem[] }) => {
    if (!itinerary || itinerary.length === 0) {
      return <p className="text-gray-500 italic">Chưa có lịch trình cụ thể.</p>;
    }
  
    return (
      <div className="space-y-4">
        {itinerary.map((item) => (
          <div key={item.day} className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-lg font-bold text-blue-600">Ngày {item.day}: {item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default TourItinerary;