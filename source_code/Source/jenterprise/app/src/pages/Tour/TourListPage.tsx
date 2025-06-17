import { useEffect, useState } from 'react'
import FilterPanel from "./components/FilterPanel";
import TourList from "./components/TourList";
import type { TourSummary } from "@/src/dtos/tour.dto";
import { fetchAllTourSummaries } from '@/src/services/tour/TourListFetch'

import {
  slogan,
  startPoints,
  endPoints,
  tourTypes,
  transports,
} from "../../services/data";
import { Card, CardContent } from "@/src/components/ui/card";
import { AxiosError } from 'axios';

export default function Tours() {
  const [tours, setTours] = useState<TourSummary[]>([])
  useEffect(() => {
    const loadTours = async () => {
      try {
        const data = await fetchAllTourSummaries()
        setTours(data)
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.log("Lấy danh sách tour thất bại: ", error.message);
        } else {
          console.error("Lấy danh sách tour thất bại:\n", error);
        }
      }
    }
    loadTours()
  }, [])


  const [sortBy, setSortBy] = useState("Ngày khởi hành gần nhất");
  const [selectedTourTypes, setSelectedTourTypes] = useState<string[]>(tourTypes);
  const [selectedTransport, setSelectedTransport] = useState<string[]>(transports);

  const toggleSelection = (type: string, list: string[], setList: Function) => {
    setList(list.includes(type) ? list.filter(item => item !== type) : [...list, type]);
  };

  return (
    <div className="container mx-auto">
      <div className="bg-blue-100 border-blue-700 border-2 p-4 rounded-3xl mb-4">
        <div className="w-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl font-bold text-blue-600">DU LỊCH TRONG NƯỚC</h1>
          <div className="text-xl font-bold text-black">{slogan}</div>
        </div>
      </div>

      <Card className="container mx-auto">
        <CardContent className="flex flex-col md:flex-row gap-6">
          <FilterPanel
            selectedTourTypes={selectedTourTypes}
            setSelectedTourTypes={setSelectedTourTypes}
            selectedTransport={selectedTransport}
            setSelectedTransport={setSelectedTransport}
            tourTypes={tourTypes}
            transports={transports}
            startPoints={startPoints}
            endPoints={endPoints}
            toggleSelection={toggleSelection}
          />
          <TourList tours={tours} sortBy={sortBy} setSortBy={setSortBy} />
        </CardContent>
      </Card>
    </div>
  );
}