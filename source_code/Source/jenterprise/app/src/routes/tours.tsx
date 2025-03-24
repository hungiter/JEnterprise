import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import dayjs from "dayjs";

const tours = [
  {
    id: 1,
    title: "Đông Bắc: Hà Giang - Lũng Cú - Mã Pí Lèng...",
    price: "10.690.000 đ",
    startCity: "TP. Hồ Chí Minh",
    startDates: ["22/03", "26/03", "29/03", "02/04"],
    img: "/images/ha-giang.jpg",
  },
  {
    id: 2,
    title: "Mùa hoa Tây Bắc: Hòa Bình - Mộc Châu - Sapa...",
    price: "12.500.000 đ",
    startCity: "TP. Hồ Chí Minh",
    startDates: ["25/03", "28/03", "03/04"],
    img: "/images/sapa.jpg",
  },
  {
    id: 3,
    title: "Mùa hoa Tây Bắc: Hòa Bình - Mộc Châu - Sapa...",
    price: "12.500.000 đ",
    startCity: "TP. Hồ Chí Minh",
    startDates: ["25/03", "28/03", "03/04"],
    img: "/images/sapa.jpg",
  },
  {
    id: 4,
    title: "Mùa hoa Tây Bắc: Hòa Bình - Mộc Châu - Sapa...",
    price: "12.500.000 đ",
    startCity: "TP. Hồ Chí Minh",
    startDates: ["25/03", "28/03", "03/04"],
    img: "/images/sapa.jpg",
  },
  {
    id: 5,
    title: "Mùa hoa Tây Bắc: Hòa Bình - Mộc Châu - Sapa...",
    price: "12.500.000 đ",
    startCity: "TP. Hồ Chí Minh",
    startDates: ["25/03", "28/03", "03/04"],
    img: "/images/sapa.jpg",
  }
];

const startPoints: Record<string, string> = {
  HCM: "TP. Hồ Chí Minh",
  HNI: "Hà Nội",
};
const endPoints: Record<string, string> = {
  "CBG": "Cao Bằng",
  "LSN": "Lạng Sơn",
}
const slogan = "Du lịch trong nước luôn là lựa chọn tuyệt vời. Đường bờ biển dài hơn 3260km, những khu bảo tồn thiên nhiên tuyệt vời, những thành phố nhộn nhịp, những di tích lịch sử hào hùng, nền văn hóa độc đáo và hấp dẫn, cùng một danh sách dài những món ăn ngon nhất thế giới, Việt Nam có tất cả những điều đó. Với lịch trình dày, khởi hành đúng thời gian cam kết, Vietravel là công ty lữ hành uy tín nhất hiện nay tại Việt Nam, luôn sẵn sàng phục vụ du khách mọi lúc, mọi nơi, đảm bảo tính chuyên nghiệp và chất lượng dịch vụ tốt nhất thị trường"
const tourTypes = ["Tour Cao Cấp", "Tour Tiết Kiệm", "Tour Trọn Gói", "Tour Gia Đình", "Tour Ghép Đoàn"];
const transports = ["Máy Bay", "Xe Du Lịch", "Tàu Hỏa", "Tàu Thủy"];

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Tours" },
    { name: "description", content: "Tours Lookup!" },
  ];
}


export default function Tours() {
  const [sortBy, setSortBy] = useState("Ngày khởi hành gần nhất");
  const [selectedTourTypes, setSelectedTourTypes] = useState<string[]>(tourTypes);
  const [selectedTransport, setSelectedTransport] = useState<string[]>(transports);
  const toggleSelection = (type: string, list: string[], setList: Function) => {
    setList(list.includes(type) ? list.filter(item => item !== type) : [...list, type]);
  };

  return (
    <div className="container mx-auto">
      <div className="bg-blue-100 border-blue-700 border-4 border-all my-2">
        <div className="w-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl font-bold text-blue-600">
            DU LỊCH TRONG NƯỚC
          </h1>

          <div className="text-xl font-bold text-black">
            {slogan}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-2 flex flex-col md:flex-row gap-6">
        {/* Bộ lọc tìm kiếm */}
        <div className="hidden md:block lg:w-1/4 md:w-2/5 bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-black">Bộ Lọc Tìm Kiếm</h2>
          {/* Điểm khởi hành */}
          <p className="text-xl text-black font-bold mb-1">Điểm khởi hành</p>
          <select className="border p-2 rounded w-full mb-2 text-black">
            <option key="all" value="all">Tất cả </option>
            {Object.entries(startPoints).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          {/* Điểm đến */}
          <p className="text-xl text-black font-bold mb-1">Điểm đến</p>
          <select className="border p-2 rounded w-full mb-2 text-black">
            <option key="all" value="all">Tất cả </option>
            {Object.entries(endPoints).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          {/* Ngày đi */}
          <p className="text-xl text-black font-bold mb-1">Ngày đi</p>
          <input type="date" className="border p-2 rounded w-full mb-2 text-black" />
          {/* Dòng tour */}
          <p className="text-xl text-black font-bold mb-2">Dòng tour</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {tourTypes.map((type) => (
              <button
                key={type}
                className={`p-2 rounded border ${selectedTourTypes.includes(type) ? "bg-blue-300 text-blue-700 font-bold" : "bg-white text-black border-gray-400"} hover:bg-gray-200`}
                onClick={() => toggleSelection(type, selectedTourTypes, setSelectedTourTypes)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Phương tiện */}
          <p className="text-xl text-black font-bold mb-2">Phương tiện</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {transports.map((transport) => (
              <button
                key={transport}
                className={`p-2 rounded border ${selectedTransport.includes(transport) ? "bg-blue-300 text-blue-700 font-bold" : "bg-white text-black border-gray-400"} hover:bg-gray-200`}
                onClick={() => toggleSelection(transport, selectedTransport, setSelectedTransport)}
              >
                {transport}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách tour */}
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
              <div key={tour.id} className="border rounded-lg overflow-hidden shadow-md p-6 flex flex-col md:flex-row">
                <img
                  src={tour.img}
                  alt={tour.title}
                  className="w-full md:w-1/3 h-48 object-cover rounded-lg"
                />
                <div className="w-full md:w-2/3 md:pl-4 mt-4 md:mt-0">
                  <h2 className="text-lg font-bold text-black">{tour.title}</h2>
                  <p className="text-red-500 font-bold">{tour.price}</p>
                  <p className="text-gray-500 font-bold">Khởi hành từ: {tour.startCity}</p>
                  <p className="text-gray-500 font-bold">Ngày khởi hành: {tour.startDates.join(", ")}</p>
                  <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
