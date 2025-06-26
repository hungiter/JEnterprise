import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            {/* Spinner chính */}
            <div className="relative">
                {/* Vòng tròn ngoài */}
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                
                {/* Icon ở giữa */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-blue-600 text-xl">✈️</div>
                </div>
            </div>
            
            {/* Text loading */}
            <div className="mt-4 text-center">
                <p className="text-gray-600 font-medium">Đang tải...</p>
                <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;