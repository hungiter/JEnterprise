import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { TourSummary } from "../dtos/tour.dto";
import { fetchAllTourSummaries } from '../services/tour/TourListFetch';
import { AxiosError } from 'axios';
import { getInstanceIdForTour } from '../utils/tourUtils';

interface TourContextProps {
    // Tour data
    tours: TourSummary[];
    loading: boolean;
    error: string | null;

    // Filter states
    sortField: string; // 'name', 'price', 'departure'
    sortDirection: 'asc' | 'desc'; // 'asc' hoặc 'desc'
    selectedTourTypes: string[];
    selectedTransport: string[];
    selectedDurations: string[];
    selectedDepartureDate: string; // New: departure date filter

    // Filter actions
    setSortField: (field: string) => void;
    setSortDirection: (direction: 'asc' | 'desc') => void;
    setSelectedTourTypes: (types: string[]) => void;
    setSelectedTransport: (transports: string[]) => void;
    setSelectedDurations: (durations: string[]) => void;
    setSelectedDepartureDate: (date: string) => void; // New: set departure date
    toggleTourType: (type: string) => void;
    toggleTransport: (transport: string) => void;
    toggleDuration: (duration: string) => void;

    // Data actions
    loadTours: () => Promise<void>;
    clearError: () => void;

    // Computed values
    filteredTours: (TourSummary & { instanceId?: string })[];
    tourTypes: string[];
    transports: string[];
    durations: string[];
    startPoints: string[];
    endPoints: string[];
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) throw new Error("useTour must be used within TourProvider");
    return context;
};

export const TourProvider = ({ children }: { children: ReactNode }) => {
    // Tour data states
    const [tours, setTours] = useState<TourSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [sortField, setSortField] = useState<string>("departure"); // 'name', 'price', 'departure'
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedTourTypes, setSelectedTourTypes] = useState<string[]>([]);
    const [selectedTransport, setSelectedTransport] = useState<string[]>([]);
    const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
    const [selectedDepartureDate, setSelectedDepartureDate] = useState<string>(""); // New: departure date filter

    // Computed tour types from tour tags
    const tourTypes = useMemo(() => {
        const tagSet = new Set<string>();

        tours.forEach(tour => {
            if (tour.tag) {
                // Split tags by comma and clean up
                const tags = tour.tag.split(',').map(tag => tag.trim());
                tags.forEach(tag => {
                    if (tag) {
                        // Convert tag to tour type format (e.g., "Cao cấp" -> "Tour Cao Cấp")
                        const tourType = tag.includes('Tour') ? tag : `Tour ${tag}`;
                        tagSet.add(tourType);
                    }
                });
            }
        });

        return Array.from(tagSet).sort();
    }, [tours]);

    // Computed transports from tour vehicles
    const transports = useMemo(() => {
        const transportSet = new Set<string>();

        tours.forEach(tour => {
            if (tour.vehicle) {
                // Split vehicles by comma and clean up
                const vehicles = tour.vehicle.split(',').map(vehicle => vehicle.trim());
                vehicles.forEach(vehicle => {
                    if (vehicle) {
                        transportSet.add(vehicle);
                    }
                });
            }
        });

        return Array.from(transportSet).sort();
    }, [tours]);

    // Computed durations from tour duration
    const durations = useMemo(() => {
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
    }, [tours]);

    // Computed start points from tour departure
    const startPoints = useMemo(() => {
        const startPointSet = new Set<string>();

        tours.forEach(tour => {
            if (tour.departure) {
                // Clean up departure string
                const departure = tour.departure.trim();
                if (departure) {
                    startPointSet.add(departure);
                }
            }
        });

        return Array.from(startPointSet).sort();
    }, [tours]);

    // Computed end points from tour title
    const endPoints = useMemo(() => {
        const endPointSet = new Set<string>();

        tours.forEach(tour => {
            if (tour.title) {
                // Parse title like "Thái Lan: Pattaya - Bangkok" to extract destinations
                const title = tour.title.trim();

                // Remove content in parentheses (...)
                const titleWithoutParentheses = title.replace(/\([^)]*\)/g, '').trim();

                let firstPart = '';

                // Check if title contains ":"
                if (titleWithoutParentheses.includes(':')) {
                    // Split by colon and take first part
                    const parts = titleWithoutParentheses.split(':').map(part => part.trim());
                    firstPart = parts[0];
                } else {
                    // If no colon, split by dash and comma, take first part
                    const parts = titleWithoutParentheses.split(/[-,]/).map(part => part.trim());
                    firstPart = parts[0];
                }

                // If first part still contains "-" or ",", split again and take all parts
                if (firstPart && (firstPart.includes('-') || firstPart.includes(','))) {
                    const subParts = firstPart.split(/[-,]/).map(part => part.trim());
                    subParts.forEach(subPart => {
                        if (subPart && subPart.length > 1 && subPart.length < 16) {
                            const destination = subPart.replace(/^\s+|\s+$/g, '');
                            if (destination && destination.length > 1) {
                                // Simple title case: capitalize first letter of each word
                                const formattedDestination = destination.split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                    .join(' ');
                                endPointSet.add(formattedDestination);
                            }
                        }
                    });
                } else {
                    // Clean up the destination name
                    if (firstPart && firstPart.length > 1 && firstPart.length < 16) {
                        const destination = firstPart.replace(/^\s+|\s+$/g, '');
                        if (destination && destination.length > 1) {
                            // Simple title case: capitalize first letter of each word
                            const formattedDestination = destination.split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');
                            endPointSet.add(formattedDestination);
                        }
                    }
                }
            }
        });

        // Remove longer duplicates to avoid redundancy (ignore case)
        const endPointsArray = Array.from(endPointSet).sort();
        const filteredEndPoints = endPointsArray.filter((point, index) => {
            // Check if this point is contained in any other longer point (ignore case)
            return !endPointsArray.some((otherPoint, otherIndex) =>
                otherIndex !== index &&
                otherPoint.toLowerCase().includes(point.toLowerCase()) &&
                otherPoint.length > point.length
            );
        });

        return filteredEndPoints;
    }, [tours]);

    // Load tours function
    const loadTours = useCallback(async () => {
        console.log('Starting to load tours...');
        setLoading(true);
        setError(null);

        try {
            const data = await fetchAllTourSummaries();
            console.log('Tours loaded successfully, count:', data.length);
            setTours(data);
        } catch (error: unknown) {
            let errorMessage = "Lấy danh sách tour thất bại";

            if (error instanceof AxiosError) {
                errorMessage = `Lấy danh sách tour thất bại: ${error.message}`;
            } else if (error instanceof Error) {
                errorMessage = `Lấy danh sách tour thất bại: ${error.message}`;
            }

            setError(errorMessage);
            console.error(errorMessage, error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Clear error function
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Toggle functions for filters
    const toggleTourType = useCallback((type: string) => {
        setSelectedTourTypes(prev =>
            prev.includes(type)
                ? prev.filter(item => item !== type)
                : [...prev, type]
        );
    }, []);

    const toggleTransport = useCallback((transport: string) => {
        setSelectedTransport(prev =>
            prev.includes(transport)
                ? prev.filter(item => item !== transport)
                : [...prev, transport]
        );
    }, []);

    const toggleDuration = useCallback((duration: string) => {
        setSelectedDurations(prev =>
            prev.includes(duration)
                ? prev.filter(item => item !== duration)
                : [...prev, duration]
        );
    }, []);

    // Computed filtered tours
    const filteredTours = useMemo(() => {
        let filtered = [...tours];

        // Filter by tour types
        if (selectedTourTypes.length > 0) {
            filtered = filtered.filter(tour =>
                selectedTourTypes.some(type =>
                    tour.tag?.includes(type.replace('Tour ', '')) || tour.title.includes(type)
                )
            );
        }

        // Filter by transport
        if (selectedTransport.length > 0) {
            filtered = filtered.filter(tour =>
                selectedTransport.some(transport =>
                    tour.vehicle?.includes(transport) || tour.title.includes(transport)
                )
            );
        }

        // Filter by duration
        if (selectedDurations.length > 0) {
            filtered = filtered.filter(tour =>
                selectedDurations.some(duration =>
                    tour.duration?.includes(duration) || tour.title.includes(duration)
                )
            );
        }

        // Filter by departure date
        if (selectedDepartureDate) {
            const selectedDate = new Date(selectedDepartureDate);
            selectedDate.setHours(0, 0, 0, 0); // Set to start of day

            filtered = filtered.filter(tour => {
                if (!tour.calendar || tour.calendar.length === 0) return false;

                return tour.calendar.some(dateStr => {
                    const tourDate = new Date(dateStr);
                    tourDate.setHours(0, 0, 0, 0); // Set to start of day
                    return tourDate.getTime() === selectedDate.getTime();
                });
            });
        }

        // Sort tours theo field và direction mới
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "name":
                    comparison = a.title.localeCompare(b.title);
                    break;
                case "price":
                    comparison = (a.price_value || 0) - (b.price_value || 0);
                    break;
                case "departure":
                    const dateA = new Date(a.calendar?.[0] || 0);
                    const dateB = new Date(b.calendar?.[0] || 0);
                    comparison = dateA.getTime() - dateB.getTime();
                    break;
                default:
                    comparison = 0;
            }

            // Áp dụng direction
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered.map(tour => ({
            ...tour,
            instanceId: getInstanceIdForTour(tour, selectedDepartureDate) || undefined
        }));
    }, [tours, selectedTourTypes, selectedTransport, selectedDurations, selectedDepartureDate, sortField, sortDirection]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        tours,
        loading,
        error,
        sortField,
        sortDirection,
        selectedTourTypes,
        selectedTransport,
        selectedDurations,
        selectedDepartureDate,
        setSortField,
        setSortDirection,
        setSelectedTourTypes,
        setSelectedTransport,
        setSelectedDurations,
        setSelectedDepartureDate,
        toggleTourType,
        toggleTransport,
        toggleDuration,
        loadTours,
        clearError,
        filteredTours,
        tourTypes,
        transports,
        durations,
        startPoints,
        endPoints,
    }), [
        tours,
        loading,
        error,
        sortField,
        sortDirection,
        selectedTourTypes,
        selectedTransport,
        selectedDurations,
        selectedDepartureDate,
        setSortField,
        setSortDirection,
        setSelectedTourTypes,
        setSelectedTransport,
        setSelectedDurations,
        setSelectedDepartureDate,
        toggleTourType,
        toggleTransport,
        toggleDuration,
        loadTours,
        clearError,
        filteredTours,
        tourTypes,
        transports,
        durations,
        startPoints,
        endPoints,
    ]);

    return (
        <TourContext.Provider value={contextValue}>
            {children}
        </TourContext.Provider>
    );
}; 