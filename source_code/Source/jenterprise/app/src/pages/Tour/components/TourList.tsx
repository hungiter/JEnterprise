import TourCard from "./TourCard";
import type { TourSummary } from '@/src/dtos/tour.dto'

type TourListProps = {
  tours: TourSummary[]
  sortBy: string
  setSortBy: (value: string) => void
}

export default function TourList({ tours, sortBy, setSortBy }: TourListProps) {
  return (
    <div className="lg:w-3/4 md:w-3/5">
      <div className="w-full flex justify-end">
        <select
          className="border p-2 rounded text-black"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="departure_date">Ngày khởi hành gần nhất</option>
          <option value="lowest_price">Giá thấp nhất</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        {tours.map((tour) => (
          <TourCard key={tour.tour_code} tour={tour} />
        ))}
      </div>
    </div>
  );
}
