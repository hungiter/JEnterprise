import React, { useState } from "react";

const TourImageGallery = ({ images = [], cover }: { images: string[]; cover?: string }) => {
    const hasThumbs = images.length > 0;
    const [selected, setSelected] = useState(cover || images[0]);
    const displayImages = images.slice(0, 4);
    const extraCount = images.length - 4;
    return (
        <div className="w-full h-[400px] flex rounded-lg overflow-hidden shadow-md">
            {/* Thumbnail list */}
            {hasThumbs && (
                <div className="w-28 flex flex-col gap-2">
                    {displayImages.map((img, idx) => (
                        <div
                            key={idx}
                            className="w-full h-1/4 relative cursor-pointer"
                            onClick={() => setSelected(img)}
                        >
                            <img
                                src={img}
                                alt={`thumb-${idx}`}
                                className="w-full h-full object-cover rounded-md"
                            />
                            {idx === 3 && extraCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 text-white text-lg font-semibold flex items-center justify-center rounded-md">
                                    +{extraCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Main image */}
            <div className={hasThumbs ? "flex-1" : "w-full"}>
                <img
                    src={selected}
                    alt="selected"
                    className="w-full h-full object-cover rounded-md"
                />
            </div>
        </div>
    );
};

export default TourImageGallery;
