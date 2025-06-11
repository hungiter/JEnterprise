package org.java_enterprise.backend.tour_service.storage.service;

import org.java_enterprise.backend.tour_service.storage.dto.TourDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.java_enterprise.backend.tour_service.storage.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TourService {
    @Autowired
    private TourRepository tourRepository;
    @Autowired
    private TourInstanceService tourInstanceService;

    public void saveTours(List<Tour> tours) {
        tourRepository.saveAll(tours);
    }

    public TourDTO getTourByCode(String code) {
        LocalDate dateThreshold = LocalDate.now().plusDays(4);
        Tour tour = tourRepository.findByTourCode(code);
        List<String> calendars = tour.getInstances().stream()
                .map(this::instanceToCalendarDate)
                .filter(date -> date != null && date.isAfter(dateThreshold))
                .map(LocalDate::toString) // convert back to String format
                .toList();
        return new TourDTO(
                tour.getTourCode(),
                tour.getThumbnail(),
                tour.getTitle(),
                tour.getDeparture(),
                tour.getDuration(),
                tour.getVehicle(),
                calendars,
                tour.getPrice(),
                tour.getPriceValue(),
                tour.getTag(),
                tour.getDetailUrl(),
                tour.getTourDetail()
        );
    }

    public List<Tour> getAllTours() {
        return tourRepository.findAll();
    }

    public List<TourSummaryDTO> getAllTourSummaries() {
        LocalDate dateThreshold = LocalDate.now().plusDays(4);
//        return Collections.emptyList();
        return tourRepository.findAll() //
                .stream() //
                .limit(100) //
                .map(tour -> {
                    List<String> instances = tour.getInstances();
                    List<String> calendars = instances.stream()
                            .map(this::instanceToCalendarDate)
                            .filter(date -> date != null && date.isAfter(dateThreshold))
                            .map(LocalDate::toString) // convert back to String format
                            .toList();

                    return new TourSummaryDTO(
                            tour.getTourCode(),
                            tour.getThumbnail(),
                            tour.getTitle(),
                            tour.getDeparture(),
                            tour.getDuration(),
                            tour.getVehicle(),
                            tour.getPrice(),
                            tour.getPriceValue(),
                            tour.getTag(),
                            calendars
                    );
                }).collect(Collectors.toList());
    }

    public List<TourSummaryDTO> getTourSummeries(List<String> tour_codes) {
        // Lấy tất cả các tour có tourCode nằm trong danh sách tour_codes
        return tourRepository.findByTourCodeIn(tour_codes).stream()
                .map(tour -> new TourSummaryDTO(
                        tour.getTourCode(),
                        tour.getThumbnail(),
                        tour.getTitle(),
                        tour.getDeparture(),
                        tour.getDuration(),
                        tour.getVehicle(),
                        tour.getPrice(),
                        tour.getPriceValue(),
                        tour.getTag(),
                        tour.getInstances()
                ))
                .collect(Collectors.toList());
    }


    // TEST INSTANCE ================================
    public List<TourInstanceSummaryDTO> getTourInstanceSummaries(String tourCode) {
        return tourInstanceService.getValidTourInstances(tourCode);
    }

    public Optional<TourInstanceDTO> getInstanceInfo(String instanceId) {
        return tourInstanceService.getTourInstanceInfo(instanceId);
    }

    // Supported
    public LocalDate instanceToCalendarDate(String instance) {
        if (instance == null || !instance.contains("_")) return null;

        try {
            String dateStr = instance.split("_")[1];
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyyMMdd"));
        } catch (Exception e) {
            return null;
        }
    }
}