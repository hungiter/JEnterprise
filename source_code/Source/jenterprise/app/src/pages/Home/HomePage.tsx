import HeroBanner from "@/src/components/HeroBanner";
import ProductCategories from "@/src/components/TravelCategories";
import Promotions from "@/src/components/Promotions";
import Combos from "@/src/components/Combos";
import Footer from "@/src/components/Footer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaGlobeAsia, FaPlaneDeparture, FaUmbrellaBeach } from "react-icons/fa";
import type { IconType } from "react-icons/lib";
import { useNavigate } from "react-router";

export default function Home() {
  // return (
  //   <div className="bg-sky-50">
  //     <HeroBanner />
  //     <ProductCategories />
  //     <Promotions />
  //     <Combos />
  //   </div>
  // );

  // TMP LOADING SCREEN - REDIRECT TO MAIN - 3S
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/tours");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const icons = [FaUmbrellaBeach, FaPlaneDeparture, FaGlobeAsia];
  const cellSize = 80;
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);

  const updateGridSize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCols(Math.ceil(w / cellSize));
    setRows(Math.ceil(h / cellSize));
  };

  useEffect(() => {
    updateGridSize();
    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, []);


  const generateRepeatingIcons = (rows: number, cols: number) => {
    const result = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = (r + c) % icons.length;
        const Icon = icons[index];
        result.push(
          <Icon
            key={`${r}-${c}`}
            className="w-6 h-6 text-white opacity-10 animate-pulse"
          />
        );
      }
    }
    return result;
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-gradient-to-br from-sky-100 to-sky-300 overflow-hidden">
      {/* Grid icon căn giữa */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          }}
        >
          {generateRepeatingIcons(rows, cols)}
        </div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl z-10"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-sky-600">Đang chuyển hướng...</h1>
        <p className="text-md lg:text-xl text-gray-700 mt-2">Chuẩn bị đưa bạn đến thế giới du lịch tuyệt vời 🌴</p>
        <div className="mt-6 w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </motion.div>
    </div>
  );
}
