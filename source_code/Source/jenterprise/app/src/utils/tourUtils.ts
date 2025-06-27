/**
 * Chuyển đổi tag thành tour type format
 * @param tag - Tag gốc (e.g., "Cao cấp")
 * @returns Tour type format (e.g., "Tour Cao Cấp")
 */
export function convertTagToTourType(tag: string): string {
    if (!tag) return '';

    // Nếu tag đã có "Tour" thì giữ nguyên
    if (tag.includes('Tour')) {
        return tag;
    }

    // Chuyển đổi format: "Cao cấp" -> "Tour Cao Cấp"
    return `Tour ${tag}`;
}

/**
 * Tạo danh sách tour types từ tags của tours
 * @param tours - Danh sách tours
 * @returns Danh sách tour types unique và đã sắp xếp
 */
export function generateTourTypesFromTours(tours: any[]): string[] {
    const tagSet = new Set<string>();

    tours.forEach(tour => {
        if (tour.tag) {
            // Split tags by comma and clean up
            const tags = tour.tag.split(',').map((tag: string) => tag.trim());
            tags.forEach((tag: string) => {
                if (tag) {
                    const tourType = convertTagToTourType(tag);
                    tagSet.add(tourType);
                }
            });
        }
    });

    return Array.from(tagSet).sort();
}

/**
 * Tạo danh sách transports từ vehicles của tours
 * @param tours - Danh sách tours
 * @returns Danh sách transports unique và đã sắp xếp
 */
export function generateTransportsFromTours(tours: any[]): string[] {
    const transportSet = new Set<string>();

    tours.forEach(tour => {
        if (tour.vehicle) {
            // Split vehicles by comma and clean up
            const vehicles = tour.vehicle.split(',').map((vehicle: string) => vehicle.trim());
            vehicles.forEach((vehicle: string) => {
                if (vehicle) {
                    transportSet.add(vehicle);
                }
            });
        }
    });

    return Array.from(transportSet).sort();
}

/**
 * Tạo danh sách durations từ duration của tours
 * @param tours - Danh sách tours
 * @returns Danh sách durations unique và đã sắp xếp
 */
export function generateDurationsFromTours(tours: any[]): string[] {
    const durationSet = new Set<string>();

    tours.forEach(tour => {
        if (tour.duration) {
            // Clean up duration string
            const duration = tour.duration.trim();
            if (duration) {
                durationSet.add(duration);
            }
        }
    });

    return Array.from(durationSet).sort();
}

/**
 * Kiểm tra xem tour có match với tour type không
 * @param tour - Tour object
 * @param tourType - Tour type (e.g., "Tour Cao Cấp")
 * @returns true nếu tour match với tour type
 */
export function isTourMatchType(tour: any, tourType: string): boolean {
    if (!tour.tag || !tourType) return false;

    // Lấy tag gốc từ tour type (e.g., "Tour Cao Cấp" -> "Cao cấp")
    const originalTag = tourType.replace('Tour ', '');

    // Kiểm tra trong tag của tour
    return tour.tag.includes(originalTag) || tour.title.includes(tourType);
}

/**
 * Kiểm tra xem tour có match với transport không
 * @param tour - Tour object
 * @param transport - Transport name
 * @returns true nếu tour match với transport
 */
export function isTourMatchTransport(tour: any, transport: string): boolean {
    if (!tour.vehicle || !transport) return false;

    return tour.vehicle.includes(transport) || tour.title.includes(transport);
}

/**
 * Kiểm tra xem tour có match với duration không
 * @param tour - Tour object
 * @param duration - Duration string
 * @returns true nếu tour match với duration
 */
export function isTourMatchDuration(tour: any, duration: string): boolean {
    if (!tour.duration || !duration) return false;

    return tour.duration.includes(duration) || tour.title.includes(duration);
}

/**
 * Lấy thông tin tổng hợp về filter options
 * @param tours - Danh sách tours
 * @returns Object chứa tất cả filter options
 */
export function getAllFilterOptions(tours: any[]) {
    return {
        tourTypes: generateTourTypesFromTours(tours),
        transports: generateTransportsFromTours(tours),
        durations: generateDurationsFromTours(tours),
    };
}

/**
 * Tạo instanceId từ tourCode và ngày
 * @param tourCode - Mã tour
 * @param date - Ngày khởi hành (Date object hoặc string)
 * @returns instanceId theo format: tourCode_YYYYMMDD
 */
export function createInstanceId(tourCode: string, date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${tourCode}_${year}${month}${day}`;
}

/**
 * Lấy instanceId cho tour dựa trên filtered date
 * @param tour - Thông tin tour
 * @param selectedDepartureDate - Ngày được chọn từ filter (có thể rỗng)
 * @returns instanceId hoặc null nếu không có ngày phù hợp
 */
export function getInstanceIdForTour(tour: any, selectedDepartureDate?: string): string | null {
    if (!tour.calendar || tour.calendar.length === 0) {
        return null;
    }

    const today = new Date();
    const upcoming = tour.calendar
        .map((date: string) => new Date(date))
        .filter((date: Date) => date >= today)
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());

    if (upcoming.length === 0) {
        return null;
    }

    let targetDate: Date;

    if (selectedDepartureDate) {
        // Nếu có filter ngày, tìm ngày trùng khớp
        const filterDate = new Date(selectedDepartureDate);
        filterDate.setHours(0, 0, 0, 0);

        const matchedDate = upcoming.find((date: Date) => {
            const tourDate = new Date(date);
            tourDate.setHours(0, 0, 0, 0);
            return tourDate.getTime() === filterDate.getTime();
        });

        if (matchedDate) {
            targetDate = matchedDate;
        } else {
            // Nếu không tìm thấy ngày trùng khớp, sử dụng ngày gần nhất
            targetDate = upcoming[0];
        }
    } else {
        // Nếu không có filter, sử dụng ngày gần nhất
        targetDate = upcoming[0];
    }

    return createInstanceId(tour.tour_code || tour.tourCode, targetDate);
}

/**
 * Tạo instanceId từ tourCode và ngày với format yyyyMMdd
 * @param tourCode - Mã tour
 * @param date - Ngày khởi hành (Date object hoặc string)
 * @returns instanceId theo format: tourCode_yyyyMMdd
 */
export function createInstanceIdDDMMYYYY(tourCode: string, date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${tourCode}_${year}${month}${day}`;
}

/**
 * Lấy instanceId cho tour dựa trên filtered date với format yyyyMMdd
 * @param tour - Thông tin tour
 * @param selectedDepartureDate - Ngày được chọn từ filter (có thể rỗng)
 * @returns instanceId hoặc null nếu không có ngày phù hợp
 */
export function getInstanceIdForTourDDMMYYYY(tour: any, selectedDepartureDate?: string): string | null {
    if (!tour.calendar || tour.calendar.length === 0) {
        return null;
    }

    const today = new Date();
    const upcoming = tour.calendar
        .map((date: string) => new Date(date))
        .filter((date: Date) => date >= today)
        .sort((a: Date, b: Date) => a.getTime() - b.getTime());

    if (upcoming.length === 0) {
        return null;
    }

    let targetDate: Date;

    if (selectedDepartureDate) {
        // Nếu có filter ngày, tìm ngày trùng khớp
        const filterDate = new Date(selectedDepartureDate);
        filterDate.setHours(0, 0, 0, 0);

        const matchedDate = upcoming.find((date: Date) => {
            const tourDate = new Date(date);
            tourDate.setHours(0, 0, 0, 0);
            return tourDate.getTime() === filterDate.getTime();
        });

        if (matchedDate) {
            targetDate = matchedDate;
        } else {
            // Nếu không tìm thấy ngày trùng khớp, sử dụng ngày gần nhất
            targetDate = upcoming[0];
        }
    } else {
        // Nếu không có filter, sử dụng ngày gần nhất
        targetDate = upcoming[0];
    }

    return createInstanceIdDDMMYYYY(tour.tour_code || tour.tourCode, targetDate);
} 