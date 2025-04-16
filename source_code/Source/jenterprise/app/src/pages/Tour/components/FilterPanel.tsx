interface FilterPanelProps {
  selectedTourTypes: string[];
  setSelectedTourTypes: (types: string[]) => void;
  selectedTransport: string[];
  setSelectedTransport: (types: string[]) => void;
  tourTypes: string[];
  transports: string[];
  startPoints: Record<string, string>;
  endPoints: Record<string, string>;
  toggleSelection: (type: string, list: string[], setList: Function) => void;
}

export default function FilterPanel({
  selectedTourTypes,
  setSelectedTourTypes,
  selectedTransport,
  setSelectedTransport,
  tourTypes,
  transports,
  startPoints,
  endPoints,
  toggleSelection,
}: FilterPanelProps) {
  return (
    <div className="hidden md:block lg:w-1/4 md:w-2/5 bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-black">Bộ Lọc Tìm Kiếm</h2>

      <p className="text-xl text-black font-bold mb-1">Điểm khởi hành</p>
      <select className="border p-2 rounded w-full mb-2 text-black">
        <option key="all" value="all">Tất cả</option>
        {Object.entries(startPoints).map(([key, value]) => (
          <option key={key} value={key}>{value}</option>
        ))}
      </select>

      <p className="text-xl text-black font-bold mb-1">Điểm đến</p>
      <select className="border p-2 rounded w-full mb-2 text-black">
        <option key="all" value="all">Tất cả</option>
        {Object.entries(endPoints).map(([key, value]) => (
          <option key={key} value={key}>{value}</option>
        ))}
      </select>

      <p className="text-xl text-black font-bold mb-1">Ngày đi</p>
      <input type="date" className="border p-2 rounded w-full mb-2 text-black" />

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
  );
}