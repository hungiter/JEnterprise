import {categories} from "../services/data"

export default function ProductCategories() {
    return (
        <div className="py-8 px-4 bg-white">
            <div className="flex justify-around flex-wrap gap-4">
                {categories.map((cat, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className="text-4xl">{cat.icon}</div>
                        <div className="text-sm font-semibold mt-2">{cat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
