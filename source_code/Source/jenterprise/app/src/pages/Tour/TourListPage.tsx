import { useEffect, useRef } from 'react'
import FilterPanel from "./components/FilterPanel";
import TourList from "./components/TourList";
import { useTour } from '@/src/context/TourContext';

import {
  slogan,
} from "../../services/data";
import { Card, CardContent } from "@/src/components/ui/card";

export default function Tours() {
  const {
    loading,
    error,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    filteredTours,
    loadTours,
    clearError
  } = useTour();

  const hasInitializedRef = useRef(false);

  // Load tours only once when component mounts
  useEffect(() => {
    // console.log('TourListPage useEffect triggered, hasInitialized:', hasInitializedRef.current);
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      loadTours();
    }
  }, []); // Empty dependency array - only run once

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-12 mb-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              DU LỊCH TRONG NƯỚC
            </h1>
            <div className="text-xl md:text-2xl font-medium opacity-90 max-w-4xl mx-auto leading-relaxed">
              {slogan}
            </div>
          </div>
        </div>
      </div> */}

      {error && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-12">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row min-h-screen">
              <div className="lg:w-2/5 xl:w-1/3">
                <FilterPanel />
              </div>

              <div className="lg:w-3/5 xl:w-2/3 p-6">
                <TourList
                  tours={filteredTours}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  setSortField={setSortField}
                  setSortDirection={setSortDirection}
                  loading={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}