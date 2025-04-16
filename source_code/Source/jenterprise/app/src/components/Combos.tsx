import {combos} from "../services/data"


export default function Combos() {
    return (
        <div className="bg-sky-50 py-8 px-4">
            <h2 className="text-xl font-bold mb-4">Combo Giá Tốt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {combos.map((combo, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
                        <img src={combo.img} alt={combo.city} className="w-full h-40 object-cover" />
                        <div className="p-4">
                            <h3 className="font-bold">{combo.city}</h3>
                            <p className="text-sm text-gray-500">{combo.hotel}</p>
                            <p className="text-blue-600 font-bold mt-2">{combo.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
