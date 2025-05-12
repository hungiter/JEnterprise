const JourneyDetail = ({ locations }: { locations: string[] }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">🗺️ Địa điểm tham quan trong hành trình</h3>
            <div className="overflow-x-auto">
                <div className="flex gap-2 items-start py-2">
                    {/* Location Boxes */}
                    {locations.map((location, idx) => (
                        <div
                            key={idx}
                            className="min-w-[80px] max-w-[120px] px-3 py-2 bg-white border border-gray-200 rounded-lg shadow text-center flex flex-col justify-center"
                        >
                            <div className="text-blue-600 text-sm font-semibold">
                                {location}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JourneyDetail;