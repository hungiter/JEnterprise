import TourCard from "./TourCard";
import Loading from "@/src/components/Loading";
import type { TourSummary } from '@/src/dtos/tour.dto'

type TourListProps = {
  tours: TourSummary[]
  sortField: string
  sortDirection: 'asc' | 'desc'
  setSortField: (field: string) => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  loading?: boolean
}

export default function TourList({ tours, sortField, sortDirection, setSortField, setSortDirection, loading = false }: TourListProps) {
  return (
    <div className="w-full">
      {/* Header section với thống kê và sắp xếp */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Thống kê số lượng tour */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              📊 {tours.length} tour có sẵn
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Đang tải...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4">
            <Loading />
          </div>
          <p className="text-gray-600 text-lg">Đang tải danh sách tour...</p>
          <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát</p>
        </div>
      ) : (
        /* Danh sách tour */
        <div className="space-y-6">
          {tours.length === 0 ? (
            // Hiển thị khi không có tour nào
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏖️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Không tìm thấy tour phù hợp
              </h3>
              <p className="text-gray-600 mb-4">
                Hãy thử điều chỉnh bộ lọc để tìm tour khác
              </p>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 max-w-md mx-auto border border-gray-200">
                <p className="text-sm text-gray-700">
                  💡 <strong>Gợi ý:</strong> Bỏ bớt một số điều kiện lọc hoặc chọn ngày khác
                </p>
              </div>
            </div>
          ) : (
            // Hiển thị danh sách tour
            tours.map((tour, index) => (
              <div key={tour.tour_code} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <TourCard tour={tour} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer với thông tin bổ sung */}
      {!loading && tours.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              💡 <strong>Mẹo:</strong> Sử dụng bộ lọc bên trái để tìm tour phù hợp nhất với bạn
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
