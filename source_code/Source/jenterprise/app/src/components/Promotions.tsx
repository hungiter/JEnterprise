import {promotions} from "../services/data"

export default function Promotions() {
    return (
        <div className="bg-sky-100 py-8 px-4">
            <h2 className="text-xl font-bold mb-4">Ưu Đãi Đặc Biệt</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {promotions.map((promo, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-md">
                        <img src={promo.img} alt={promo.title} className="rounded-md mb-2" />
                        <h3 className="text-md font-semibold">{promo.title}</h3>
                        <p className="text-blue-600 font-bold">{promo.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
