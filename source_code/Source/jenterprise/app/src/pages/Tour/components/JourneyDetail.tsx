const JourneyDetail = ({ locations }: { locations: string[] }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
                🗺️ Địa điểm tham quan trong hành trình
            </h3>

            {/* Scrollable Horizontal List */}
            <div className="overflow-x-auto">
                <div className="flex gap-3 py-2 w-max">
                    {locations.map((location, idx) => (
                        <div
                            key={idx}
                            className="min-w-[120px] px-4 py-2 bg-white border border-gray-200 rounded-lg shadow text-center"
                        >
                            <div className="text-blue-600 text-sm font-semibold break-words">
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