import { useTour } from '@/src/context/TourContext';

export default function FilterPanel() {
  // Lấy dữ liệu filter và functions từ TourContext
  const {
    selectedTourTypes,
    setSelectedTourTypes,
    selectedTransport,
    setSelectedTransport,
    selectedDurations,
    setSelectedDurations,
    selectedDepartureDate,
    setSelectedDepartureDate,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    toggleTourType,
    toggleTransport,
    toggleDuration,
    tourTypes,
    transports,
    durations,
    startPoints,
    endPoints,
  } = useTour();

  return (
    <div className="hidden lg:block bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 sticky top-4 h-fit max-h-[calc(100vh-1rem)] overflow-y-auto pb-8">
      {/* Tiêu đề bộ lọc */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bộ Lọc Tìm Kiếm</h2>
      </div>

      <div className="flex flex-col gap-6 pl-4 pr-2">
        {/* Sắp xếp */}
        <div>
          <div className="flex items-center justify-end gap-3 py-3" id="sort-direction">
            <span className="text-sm font-medium text-gray-700">
              Sắp xếp theo
            </span>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 flex items-center justify-center group"
              title={sortDirection === 'asc' ? 'Chuyển sang giảm dần' : 'Chuyển sang tăng dần'}
            >
              {sortDirection === 'asc' ? (
                <svg
                  className="w-4 h-4 text-indigo-600 group-hover:text-indigo-800 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-indigo-600 group-hover:text-indigo-800 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l4-4m-4 4v-12" />
                </svg>
              )}
            </button>
          </div>

          {/* Dropdown chọn tiêu chí sắp xếp */}
          <div className="relative mb-3">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400"
            >
              <option value="name" className="py-2">📝 Tên tour</option>
              <option value="price" className="py-2">💰 Giá</option>
              <option value="departure" className="py-2">📅 Ngày khởi hành</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter điểm khởi hành */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Điểm khởi hành
          </label>
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400">
              <option value="all" className="py-2">🌍 Tất cả điểm khởi hành</option>
              {startPoints.map((point) => (
                <option key={point} value={point} className="py-2">{point}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter điểm đến */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Điểm đến
          </label>
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400">
              <option value="all" className="py-2">🎯 Tất cả điểm đến</option>
              {endPoints.map((point) => (
                <option key={point} value={point} className="py-2">{point}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter ngày khởi hành */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Ngày khởi hành
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDepartureDate}
              onChange={(e) => setSelectedDepartureDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm cursor-pointer hover:border-gray-400"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {selectedDepartureDate && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Đã chọn: {new Date(selectedDepartureDate).toLocaleDateString('vi-VN')}
              </span>
              <button
                onClick={() => setSelectedDepartureDate("")}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          )}
        </div>

        {/* Filter thời gian tour */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thời gian tour ({selectedDurations.length} đã chọn)
          </label>
          <div className="flex flex-wrap gap-2">
            {durations.sort((a, b) => a.length - b.length).map((duration) => (
              <button
                key={duration}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm whitespace-nowrap max-w-full ${selectedDurations.includes(duration)
                  ? "bg-purple-100 border-purple-300 text-purple-700 font-medium shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                onClick={() => toggleDuration(duration)}
                title={duration}
              >
                <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedDurations.includes(duration)
                  ? "bg-purple-600 border-purple-600"
                  : "border-gray-300"
                  }`}>
                  {selectedDurations.includes(duration) && (
                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="truncate">{duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter loại tour */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Dòng tour ({selectedTourTypes.length} đã chọn)
          </label>
          <div className="space-y-2">
            {tourTypes.map((type) => (
              <button
                key={type}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${selectedTourTypes.includes(type)
                  ? "bg-blue-100 border-blue-300 text-blue-700 font-medium shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                onClick={() => toggleTourType(type)}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedTourTypes.includes(type)
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-300"
                  }`}>
                  {selectedTourTypes.includes(type) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="flex-1">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter phương tiện */}
        {/* <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Phương tiện ({selectedTransport.length} đã chọn)
          </label>
          <div className="space-y-2">
            {transports.map((transport) => (
              <button
                key={transport}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${selectedTransport.includes(transport)
                  ? "bg-green-100 border-green-300 text-green-700 font-medium shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                onClick={() => toggleTransport(transport)}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedTransport.includes(transport)
                    ? "bg-green-600 border-green-600"
                    : "border-gray-300"
                  }`}>
                  {selectedTransport.includes(transport) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="flex-1">{transport}</span>
              </button>
            ))}
          </div>
        </div> */}

        {/* Thống kê kết quả */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {tourTypes.length + transports.length + durations.length}
            </div>
            <div className="text-sm text-blue-700">
              Tùy chọn lọc có sẵn
            </div>
            <div className="mt-2 text-xs text-blue-600">
              ✨ Tự động cập nhật từ dữ liệu thực tế
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}