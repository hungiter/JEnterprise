import { useParams, Link } from "react-router-dom";
import { tours } from "../../services/data";
import { Card, CardContent } from "@/src/components/ui/card";
import { Section } from "@/src/components/ui/section";
import { useEffect, useState } from 'react';

import TourImageGallery from "./components/TourImageGallery";
import TourItinerary from "./components/TourItinerary";
import UpcomingTourDates from "./components/UpcomingTourDates";
import TripExtraInfo from "./components/TripExtraInfo";
import type { RecommendResult, Tour, TourSummary } from "@/src/dtos/tour.dto";
import { fetchTourByCode } from "@/src/services/tour/TouDetaillFetch";
import { fetchSimilarTours } from "@/src/services/tour/TourSimilarFound";
import { fetchSummaryTours } from "@/src/services/tour/SummaryToursFetch";
import JourneyDetail from "./components/JourneyDetail";
import SimilarTourCard from "./components/SimilarTourCard";
import { createPaymentOrder } from "@/src/services/payment/CreateOrder";
import { user } from "@/src/services/session"

export default function TourDetail() {
  const { tourCode } = useParams<{ tourCode: string }>();


  const [tour, setTour] = useState<Tour | null>(null);
  const [tourError, setTourError] = useState<string | null>(null);
  const [tourLoading, setTourLoading] = useState<boolean>(true);

  const [recommendResult, setRecommendResult] = useState<RecommendResult | null>(null);
  const [similarTours, setSimilarTours] = useState<TourSummary[] | null>(null);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [similarLoading, setSimilarLoading] = useState<boolean>(true);
  const [similarContent, setSimilarContent] = useState<any>(null);

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentUrlError, setPaymentUrlError] = useState<string | null>(null);
  const [paymentUrlLoading, setPaymentUrlLoading] = useState<boolean>(false);
  useEffect(() => {
    if (!tourCode) {
      setTourError('Tour code is missing.');
      setTourLoading(false);
      return;
    }

    const getTourDetails = async () => {
      try {
        const fetchedTour = await fetchTourByCode(tourCode);
        setTour(fetchedTour);
      } catch (error) {
        setTourError(`Failed to fetch similar ${tourCode}'s details:\n${error}`);
      } finally {
        setTourLoading(false);
      }
    };

    const getSimilarTours = async () => {
      try {
        const fetchedResult = await fetchSimilarTours(tourCode);
        setRecommendResult(fetchedResult);
      } catch (error) {
        setSimilarError(`Failed to fetch similar tour codes:\n${error}`);
        setSimilarLoading(false);
      } finally {
        /* Do nothing */
      }
    };

    getTourDetails();
    getSimilarTours();
  }, [tourCode]);

  useEffect(() => {
    if (recommendResult?.summary?.length) {
      const getSummaryTours = async () => {
        try {
          const fetchedResult = await fetchSummaryTours(recommendResult.summary);
          setSimilarTours(fetchedResult);
        } catch (error) {
          setSimilarError(`Failed to fetch similar tours's info:\n${error}`);
        } finally {
          setSimilarLoading(false);
        }
      };

      getSummaryTours();
    }
  }, [recommendResult]);

  useEffect(() => {
    let tmpContent;
    if (similarLoading) {
      tmpContent = (
        <div className="animate-pulse h-4 w-full bg-gray-200 rounded">
          {/* Loading... */}
        </div>
      );
    } else if (similarError) {
      tmpContent = (
        <div className="text-center w-full text-red-500 font-bold">
          {similarError}
        </div>
      );
    } else if (similarTours && similarTours.length > 0) {
      tmpContent = similarTours.map((tour) => (
        <SimilarTourCard key={tour.tour_code} tour={tour} />
      ));
    } else {
      tmpContent = (
        <div className="text-center text-gray-400 italic">
          Không có tour tương tự.
        </div>
      );
    }

    setSimilarContent(tmpContent)
  }, [tourCode, similarLoading, similarError, similarTours]);

  const getPaymentUrl = async () => {
    try {
      if (!user) {
        console.log("Chưa đăng nhập!!!")
        return
      }
      if (!tour) {
        console.log("Tour không tồn tại!!!")
        return
      }

      setPaymentUrlLoading(true);
      const fetchedResult = await createPaymentOrder(tour, user);
      if (fetchedResult.success) {
        setPaymentUrl(fetchedResult.url);
      } else {
        setPaymentUrlError(`Failed to fetch similar tours's info:\n${fetchedResult.message}`);
      }
    } catch (error) {
      setPaymentUrlError(`Failed to fetch similar tours's info:\n${error}`);
    } finally {
      setPaymentUrlLoading(false);
    }
  };
  useEffect(() => {
    if (paymentUrl) {
      // window.open(paymentUrl, '_blank');
      window.location.href = paymentUrl;
    }
  }, [paymentUrl])


  if (!tour) return <div className="text-center text-red-500">Không tìm thấy tour</div>;

  return (
    <div className="container mx-auto text-black">
      <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="lg:w-3/4 md:w-2/3 bg-gray-100 rounded-lg">
            <Card className="container mx-auto mt-4">
              <CardContent className="flex flex-col md:flex-row gap-6">
                <TourImageGallery
                  cover={tour.tourDetail.img_main}
                  images={tour.tourDetail.img_thumbnails}
                />
              </CardContent>
            </Card>

            {/* Lịch khởi hành sắp tới */}
            <div className="mt-6">
              <UpcomingTourDates dates={tour.calendar} />
            </div>
            {/* Hành trình */}
            <div className="mt-6">
              <JourneyDetail locations={tour.tourDetail.sightseeing_spots.trim().split(", ").join(",").split(",")} />
            </div>
            <TripExtraInfo info={tour.tourDetail} />

            <Card className="container mx-auto mt-4">
              <CardContent>
                {/* Lịch trình chi tiết */}
                <div className="space-y-4">
                  {/* <TourItinerary itinerary={tour.itinerary} /> */}
                  <TourItinerary itinerary={tour.tourDetail.trip_plan} />
                </div>
              </CardContent>
            </Card>

            <Card className="container mx-auto mt-4">
              <CardContent>
                <div className="lg:overflow-x-auto xl:overflow-x-hidden w-full">
                  <div className="flex flex-col w-full lg:flex-row lg:w-max gap-6 py-2 ">
                    {similarContent}
                  </div>
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
                  <strong className="text-red-500">{tour.price}</strong> <span className="text-sm font-semibold">/ Khách</span>
                </p>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex flex-col md:flex-row gap-2 md:w-3/5 ">
                    <div>Mã tour: <span className="font-bold">{tour.tourCode}</span></div>
                  </div>
                </div>

                <p className="mt-2">
                  {/* <Link to={`/tours/${tour.tourCode}`}>
                    <button className="bg-blue-500 md:w-full text-white px-4 py-2 rounded">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-full h-full">
                        <div className="text-sm font-semibold">Chọn ngày khởi hành</div>
                      </div>
                    </button>
                  </Link> */}
                  <button className="bg-blue-500 md:w-full text-white px-4 py-2 rounded" onClick={getPaymentUrl}>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-full h-full">
                      <div className="text-sm font-semibold">Đặt tour</div>
                    </div>
                  </button>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
