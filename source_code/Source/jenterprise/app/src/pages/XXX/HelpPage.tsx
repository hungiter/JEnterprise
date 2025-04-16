import { useState } from "react";
import { helpData } from "~/src/services/data";
import { Card, CardContent } from "~/src/components/ui/card";

const HelpPage = () => {
    type HelpCategory = keyof typeof helpData;
    const [activeTab, setActiveTab] = useState<HelpCategory>("tour");
    const [openIndexes, setOpenIndexes] = useState<number[]>([]);

    const handleToggle = (index: number) => {
        setOpenIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const renderQuestions = (category: keyof typeof helpData) =>
        helpData[category].map((item, index: number) => (
            <div key={index} className="mb-4 bg-blue-100 p-4 rounded-md">
                <button
                    onClick={() => handleToggle(index)}
                    className="font-semibold text-blue-700 w-full text-left flex justify-between"
                >
                    {item.question}
                    <span>{openIndexes.includes(index) ? "▲" : "▼"}</span>
                </button>
                {openIndexes.includes(index) && (
                    <p className="mt-2 text-gray-700">{item.answer}</p>
                )}
            </div>
        ));

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 text-black">
            <h1 className="text-3xl font-bold mb-4">Trợ giúp</h1>
            <Card>
                <CardContent className="space-y-4 p-6">
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <div className="w-40 bg-white border-r border-gray-200 p-2">
                            {[
                                { key: "tour", label: "Tour" },
                                { key: "datTour", label: "Đặt tour" },
                                { key: "thanhVien", label: "Thành viên" }
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => {
                                        setActiveTab(item.key as "tour" | "datTour" | "thanhVien");
                                        setOpenIndexes([]);
                                    }}
                                    className={`w-full flex items-center gap-2 p-2 rounded-md mb-2 ${activeTab === item.key ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-black"
                                        }`}
                                >
                                    <span>📌</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 bg-blue-50">
                            <h1 className="text-xl font-bold text-center text-blue-800 mb-6">Trợ giúp</h1>
                            <div>{renderQuestions(activeTab)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HelpPage;
