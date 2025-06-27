import { useState } from 'react';

export default function HeroBanner() {
    const [destination, setDestination] = useState('');

    return (
        <div className="relative w-full h-[500px]">
            <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                alt="Banner"
                className="w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-3xl">
                    <h2 className="text-xl font-bold mb-4 text-center">Tìm Tour Du Lịch</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Điểm đến..."
                            className="p-2 border rounded-md"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                        <input
                            type="date"
                            className="p-2 border rounded-md"
                        />
                    </div>
                    <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700">
                        Tìm kiếm
                    </button>
                </div>
            </div>
        </div>
    );
}
