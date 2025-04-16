import { Link } from "react-router-dom";

interface Tour {
  id: number;
  title: string;
  price: string;
  startCity: string;
  startDates: string[];
  img: string;
}

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md p-6 flex flex-col md:flex-row relative">
      <img
        src={tour.img}
        alt={tour.title}
        className="w-full md:w-1/3 h-48 object-cover rounded-lg text-black"
      />
      <div className="w-full md:w-2/3 md:pl-4 mt-4 md:mt-0 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-black">{tour.title}</h2>
          <p className="text-red-500 font-bold">{tour.price}</p>
          <p className="text-gray-500 font-bold">Khởi hành từ: {tour.startCity}</p>
          <p className="text-gray-500 font-bold">Ngày khởi hành: {tour.startDates.join(", ")}</p>
        </div>
        <div className="flex justify-end mt-4">
          <Link to={`/tours/${tour.id}`}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Xem chi tiết
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
