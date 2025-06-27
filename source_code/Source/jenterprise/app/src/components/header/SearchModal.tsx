// Create a search modal component
import { FaSearch, FaTimes, FaPlus, FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useSearch } from "../../context/SearchContext";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { memo, useRef, useEffect } from "react";

const SearchModal = () => {
    const {
        onFocus,
        setOnFocus,
        input,
        setInput,
        searchTags,
        selectedTags,
        addSelectedTag,
        removeSelectedTag,
        startSearching,
        searchResult,
        loading
    } = useSearch();

    const { showWarning } = useToast();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const runSearchEvent = () => {
        let hasInput = input.trim() !== "";
        let hasTags = selectedTags.length > 0;

        if (!hasInput && !hasTags) {
            showWarning("Không có thông tin để tìm kiếm");
            return;
        }

        startSearching((tags: string[]) => {
            if (tags.length > 0) {
                setOnFocus(false);
                navigate(`/search?tags=${tags.join(',')}`);
            } else {
                showWarning("Không có thông tin để tìm kiếm");
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearchEvent();
        }
    };

    const handleSearch = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        runSearchEvent();
    };

    const handleClick = (e: React.MouseEvent) => {
        // If clicking inside the container but not on the input, focus the input
        if (containerRef.current?.contains(e.target as Node) &&
            !(e.target as Node).contains(inputRef.current)) {
            inputRef.current?.focus();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOnFocus(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            className="relative w-full max-w-2xl"
            ref={containerRef}
            onClick={handleClick}
        >
            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #eff6ff; /* blue-50 - lighter background */
                    border-radius: 8px;
                    margin: 2px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #93c5fd; /* blue-300 - softer blue */
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    border: 1px solid #dbeafe; /* blue-100 border */
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #60a5fa; /* blue-400 - slightly darker on hover */
                    transform: scale(1.05);
                }
                
                /* Firefox scrollbar */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #93c5fd #eff6ff;
                }
            `}</style>

            {/* Search Input and Button */}
            <div className={`flex items-center border rounded-lg bg-white text-black ${onFocus ? 'border-blue-500' : 'border-gray-300'}`}>
                <div className="flex-1 flex items-center p-2">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOnFocus(true)}
                        placeholder="Tìm kiếm theo địa điểm, hoạt động, sở thích..."
                        className="w-full outline-none"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="hidden md:block px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 cursor-pointer"
                    title="Tìm kiếm tour với các từ khóa đã chọn"
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Search Suggestions Box */}
            {onFocus && (
                <div className="absolute w-full bg-white mt-1 border rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto">
                    {/* Selected Tags Section */}
                    <div className="p-4 border-b">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">Từ khoá đã chọn</h3>
                            <FaQuestionCircle
                                className="text-gray-400 hover:text-gray-600 cursor-help"
                                title="Nhấn 'x' để xóa từ khóa này khỏi danh sách tìm kiếm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.length > 0 ? (
                                selectedTags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm cursor-pointer hover:bg-gray-200 group relative"
                                        title={`Tìm kiếm tour với từ khóa: ${tag}`}
                                    >
                                        <span>{tag}</span>
                                        <FaTimes
                                            size={12}
                                            className="ml-2 text-gray-600 hover:text-red-600 font-normal hover:font-bold"
                                            onClick={() => removeSelectedTag(tag)}
                                            title="Xóa từ khóa này"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-sm">
                                    Chưa có tag nào được chọn. Thêm tag để tìm kiếm.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Suggestion Tags Section */}
                    <div className="p-4 border-b">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">Từ khóa gợi ý</h3>
                            <FaQuestionCircle
                                className="text-gray-400 hover:text-gray-600 cursor-help"
                                title="Nhấn '+' để thêm từ khóa này vào danh sách tìm kiếm"
                            />
                        </div>
                        <div className="max-h-[120px] overflow-y-auto custom-scrollbar">
                            <div className="flex flex-wrap gap-2">
                                {(() => {
                                    const filteredTags = searchTags.filter((tag) => !selectedTags.includes(tag));
                                    const sortedTags = filteredTags.sort((a, b) => a.length - b.length);
                                    
                                    if (sortedTags.length > 0) {
                                        return sortedTags.map((tag) => (
                                            <div
                                                key={tag}
                                                className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm cursor-pointer hover:bg-gray-200 group relative"
                                                title={`Thêm từ khóa: ${tag} vào tìm kiếm`}
                                            >
                                                <span>{tag}</span>
                                                <FaPlus
                                                    size={12}
                                                    className="ml-2 text-gray-600 hover:text-blue-600 font-bold hover:font-bold"
                                                    onClick={() => addSelectedTag(tag)}
                                                    title="Thêm từ khóa này"
                                                />
                                            </div>
                                        ));
                                    } else if (searchTags.length > 0) {
                                        return (
                                            <div className="text-gray-500 text-sm">
                                                Tất cả gợi ý đã được chọn
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="text-gray-500 text-sm">
                                                {input.trim() ? "Không có gợi ý" : "Nhập từ gì đó để gợi ý"}
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Search Results Section */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">Gợi ý tour</h3>
                            <FaQuestionCircle
                                className="text-gray-400 hover:text-gray-600 cursor-help"
                                title="Nhấn vào tour để xem chi tiết"
                            />
                        </div>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2 text-gray-500">Loading...</p>
                            </div>
                        ) : searchResult.length > 0 ? (
                            <div className="space-y-3 text-black">
                                {searchResult.map((tour) => (
                                    <div
                                        key={tour.tour_code}
                                        className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        onClick={() => navigate(`/tours/${tour.tour_code}`)}
                                        title={`Xem chi tiết tour: ${tour.title}`}
                                    >
                                        <img
                                            src={tour.thumbnail}
                                            alt={tour.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium">{tour.title}</h4>
                                            <p className="text-sm text-gray-600">
                                                {tour.duration} • {tour.vehicle}
                                            </p>
                                            <p className="text-blue-600 font-medium">{tour.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-start text-gray-500">
                                {(selectedTags.length > 0 || input.trim() !== "")
                                    ? "Không có tour phù hợp với những tag bạn đã chọn"
                                    : "Chưa có tag hay từ khoá để tìm kiếm."}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(SearchModal);