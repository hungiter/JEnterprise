import { useParams, Link } from "react-router-dom";
import { tours } from "../../services/data";
import { Card, CardContent } from "~/src/components/ui/card";
import { Section } from "~/src/components/ui/section";
import { useState } from 'react';

import TourImageGallery from "./components/TourImageGallery";
import TourItinerary from "./components/TourItinerary";
import UpcomingTourDates from "./components/UpcomingTourDates";
import TripExtraInfo from "./components/TripExtraInfo";

export default function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const tour = tours.find((t) => t.id === (id));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!tour) return <div className="text-center text-red-500">Không tìm thấy tour</div>;

  return (
    // <div className="container mx-auto p-4">
    //   <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
    //   <img src={tour.img} alt={tour.title} className="w-full max-w-xl h-96 object-cover rounded-lg" />
    //   <p className="text-xl text-red-500 mt-4 font-bold">Giá: {tour.price}</p>
    //   <p className="text-gray-700 mt-2">Khởi hành từ: {tour.startCity}</p>
    //   <p className="text-gray-700">Ngày khởi hành: {tour.startDates.join(", ")}</p>
    // </div>

    <div className="container mx-auto text-black">
      <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="lg:w-3/4 md:w-2/3 bg-gray-100 rounded-lg">
            <Card className="container mx-auto mt-4">
              <CardContent className="flex flex-col md:flex-row gap-6">
                <TourImageGallery
                  cover="https://media.travel.com.vn/Tour/tfd__2_13054_meo-vac-and-dong-van-town1.webp"
                  images={tour.images}
                // images={[]}
                />
              </CardContent>
            </Card>

            <div className="mt-6">
              <UpcomingTourDates dates={tour.startDates} />
            </div>
            <TripExtraInfo info={tour.extraInfo} />

            <Card className="container mx-auto mt-4">
              <CardContent className="flex flex-col md:flex-row gap-6">
                {/* Hành trình */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Hành trình:</h2>
                  <p className="mb-4">
                    Hà Nội – Hà Giang – Đồng Văn – Lũng Cú – Mã Pí Lèng – Cao Bằng – Thác Bản Giốc – Hồ Ba Bể – Hà Nội
                  </p>

                  {/* Điểm nhấn chương trình */}
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Điểm nhấn chương trình</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Chinh phục Cột cờ Lũng Cú – điểm cực Bắc của Tổ quốc</li>
                      <li>Chinh phục đèo Mã Pí Lèng – Top 4 "Tứ đại đỉnh đèo" Việt Nam</li>
                      <li>Khám phá thác Bản Giốc – một trong những thác nước đẹp nhất Đông Nam Á</li>
                      <li>Du thuyền trên hồ Ba Bể thơ mộng</li>
                      <li>Thưởng thức ẩm thực vùng cao đặc sắc</li>
                    </ul>
                  </div>
                </div>


                {/* Lịch trình chi tiết */}
                <div className="space-y-4">
                  <TourItinerary itinerary={tour.itinerary} />
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="hidden sm:none md:block lg:w-1/4 md:w-1/3 rounded-lg">
            <Card className="container mx-auto text-black">
              <CardContent>
                <p className="mb-2 text-2xl">
                  <strong className="text-xl ">Giá từ:</strong>
                </p>
                <p className="mb-2 text-2xl">
                  <strong className="text-red-500">{tour.price} ₫</strong> <span className="text-sm font-semibold">/ Khách</span>
                </p>

                <p className="flex flex-col md:flex-row gap-2">
                  <div className="flex flex-col md:flex-row gap-2 md:w-3/5 ">
                    <img src={tour.img} alt="" className="object-cover rounded-lg" height={20} width={20} />
                    <div>Mã chương trình:</div>
                  </div>
                  <div className="md:w-2/5 font-bold">{tour.id}</div>
                </p>

                <p className="mt-2">
                  <Link to={`/tours/${tour.id}`}>
                    <button className="bg-blue-500 md:w-full text-white px-4 py-2 rounded">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-full h-full">
                        <img src={tour.img} alt="" className="object-cover rounded-lg" height={10} width={20} />
                        <div className="text-sm font-semibold">Chọn ngày khởi hành</div>
                      </div>
                    </button>

                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
