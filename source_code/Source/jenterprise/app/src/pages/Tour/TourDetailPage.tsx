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
import Loading from "@/src/components/Loading";
import { useLogin } from "@/src/context/LoginContext";
import { clearCookie, getCookie } from "@/src/services/cookies/Cookies";
import { useVnpay, createPaymentRequest } from "@/src/context/VnpayContext";
import { AxiosError } from "axios";
import { FaUsers, FaPlus, FaMinus } from "react-icons/fa";
import { createTourOrder } from "@/src/services/tour/TourOrderService";
import { getUserInfoFromCookie } from "@/src/context/LoginContext";
import { useTour } from "@/src/context/TourContext";
import { getInstanceIdForTourDDMMYYYY } from "@/src/utils/tourUtils";

export default function TourDetail() {
  const { tourCode } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [tourLoading, setTourLoading] = useState(true);
  const [tourError, setTourError] = useState<string | null>(null);

  const [recommendResult, setRecommendResult] = useState<RecommendResult | null>(null);
  const [similarTours, setSimilarTours] = useState<TourSummary[]>([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [similarContent, setSimilarContent] = useState<React.ReactNode>(null);

  const { setShowLogin } = useLogin();
  const { setRequest } = useVnpay();
  const { selectedDepartureDate } = useTour();

  // State cho số vé
  const [ticketQuantity, setTicketQuantity] = useState(1);

  useEffect(() => {
    const getTourDetails = async () => {
      try {
        const fetchedTour = await fetchTourByCode(tourCode!);
        setTour(fetchedTour);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          setTourError(`Lấy thông tin tour ${tourCode} thất bại: ${error.message}`);
        } else {
          setTourError(`Lấy thông tin tour ${tourCode} thất bại: ${error}`);
        }
      } finally {
        setTourLoading(false);
      }
    };

    const getSimilarTours = async () => {
      try {
        const fetchedResult = await fetchSimilarTours(tourCode!);
        setRecommendResult(fetchedResult);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          setSimilarError(`Lấy tour tương tự thất bại: ${error.message}`);
        } else {
          setSimilarError(`Lấy tour tương tự thất bại: ${error}`);
        }
      } finally {
        setSimilarLoading(false);
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
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            setSimilarError(`Lấy tour tương tự thất bại: ${error.message}`);
          } else {
            setSimilarError(`Lấy tour tương tự thất bại: ${error}`);
          }
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
        <Loading />
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

  // Xử lý tăng/giảm số vé
  const handleIncreaseTickets = () => {
    if (ticketQuantity < 20) {
      setTicketQuantity(prev => prev + 1);
    }
  };

  const handleDecreaseTickets = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity(prev => prev - 1);
    }
  };

  // Xử lý đặt tour - sử dụng flow: check user -> createTourOrder -> createPaymentUrl
  const handleBookTour = async () => {
    try {
      // 1. Check user login
      let token = getCookie("accessToken");
      if (token == null) {
        setShowLogin(true);
        return;
      }

      if (!tour) {
        alert("Không tìm thấy thông tin tour!");
        return;
      }

      const userInfo = getUserInfoFromCookie();
      if (!userInfo) {
        clearCookie("accessToken");
        setShowLogin(true);
        return;
      }

      // 2. Create tour order with instanceId
      const instanceId = getInstanceId();
      if (!instanceId) {
        alert("Không thể tạo mã chuyến cho tour này!");
        return;
      }

      const orderResult = await createTourOrder({
        instanceId: instanceId,
        username: userInfo.username,
        totalTicket: ticketQuantity,
        ticketPrice: tour.priceValue
      });

      if (!orderResult.success) {
        alert(`Lỗi tạo đơn hàng: ${orderResult.message}`);
        return;
      }

      // 3. Success -> Create payment URL
      const totalAmount = tour.priceValue * ticketQuantity;
      const paymentResult = await createPaymentOrder(tour, userInfo, instanceId, ticketQuantity, totalAmount);

      if (paymentResult.success && paymentResult.url) {
        // Redirect to payment URL
        window.location.href = paymentResult.url;
      } else {
        alert(`Lỗi tạo thanh toán: ${paymentResult.message}`);
      }

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(`Đặt tour thất bại: ${error.message}`);
        alert(`Lỗi: ${error.message}`);
      } else {
        console.error(`Đặt tour thất bại:\n${error}`);
        alert('Có lỗi xảy ra khi đặt tour');
      }
    }
  };

  // const getPaymentUrl = async () => {
  //   try {
  //     let token = getCookie("accessToken");
  //     if (token == null) {
  //       setShowLogin(true)
  //       return
  //     }

  //     if (!tour) {
  //       console.log("Tour không tồn tại!!!")
  //       return
  //     }

  //     const paymentInfo = createPaymentRequest(tour);
  //     if (paymentInfo != null) {
  //       setRequest(paymentInfo)
  //     } else {
  //       clearCookie("accessToken");
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof AxiosError) {
  //       console.log(`Tạo đơn hàng thất bại: ${error.message}`);
  //     } else {
  //       console.error(`Tạo đơn hàng thất bại:\n${error}`);
  //     }
  //   }
  // };

  if (tourLoading) return <Loading />
  if (!tour) return <div className="text-center text-red-500">Không tìm thấy tour</div>;

  // Tính tổng tiền
  const totalAmount = tour.priceValue * ticketQuantity;
  // Tạo instanceId theo logic tương tự TourCard
  const getInstanceId = (): string | null => {
    if (selectedDepartureDate) {
      return getInstanceIdForTourDDMMYYYY(tour, selectedDepartureDate);
    } else {
      const firstDate = tour.calendar[0];
      return getInstanceIdForTourDDMMYYYY(tour, firstDate);
    }
  };

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
                  <TourItinerary itinerary={tour.tourDetail.trip_plan} />
                </div>
              </CardContent>
            </Card>

            <Card className="container mx-auto mt-4">
              <CardContent>
                <div className="overflow-x-hidden md:overflow-x-auto w-full">
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

                {/* Instance ID */}
                {(() => {
                  const instanceId = getInstanceId();
                  return instanceId ? (
                    <div className="flex flex-col md:flex-row gap-2 mt-2">
                      <div className="flex flex-col md:flex-row gap-2 md:w-3/5 ">
                        <div>Mã chuyến: <span className="font-bold font-mono text-green-600">{instanceId}</span></div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Chọn số vé */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <FaUsers className="w-4 h-4 mr-2 text-blue-600" />
                      Số vé:
                    </label>
                    <span className="text-lg font-bold text-blue-600">{ticketQuantity}</span>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={handleDecreaseTickets}
                      disabled={ticketQuantity <= 1}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${ticketQuantity <= 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110'
                        }`}
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>

                    <span className="text-xl font-bold text-gray-800 min-w-[40px] text-center">
                      {ticketQuantity}
                    </span>

                    <button
                      onClick={handleIncreaseTickets}
                      disabled={ticketQuantity >= 20}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${ticketQuantity >= 20
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110'
                        }`}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {totalAmount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>

                <p className="mt-4">
                  <button
                    className="bg-blue-500 md:w-full text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold"
                    onClick={handleBookTour}
                  >
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-full h-full">
                      <div className="text-sm font-semibold">Đặt {ticketQuantity} vé</div>
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
