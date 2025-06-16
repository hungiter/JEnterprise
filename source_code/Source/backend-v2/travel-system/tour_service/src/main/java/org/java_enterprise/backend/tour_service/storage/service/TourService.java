package org.java_enterprise.backend.tour_service.storage.service;

import org.java_enterprise.backend.tour_service.storage.dto.TourDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.java_enterprise.backend.tour_service.storage.model.TourEngagement;
import org.java_enterprise.backend.tour_service.storage.model.TourOrder;
import org.java_enterprise.backend.tour_service.storage.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TourService {
    @Autowired
    private TourRepository tourRepository;
    @Autowired
    private TourInstanceService tourInstanceService;
    @Autowired
    private TourEngagementService tourEngagementService;
    @Autowired
    private TourOrderService tourOrderService;
    @Autowired
    private TourTagService tourTagService;

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


    // INSTANCE SERVICE ================================
    public List<TourInstanceSummaryDTO> getTourInstanceSummaries(String tourCode) {
        return tourInstanceService.getValidTourInstances(tourCode);
    }

    public Optional<TourInstanceDTO> getInstanceInfo(String instanceId) {
        return tourInstanceService.getTourInstanceInfo(instanceId);
    }

    // TAG SERVICE ==================================
    public List<String> getTagByString(String input) {
        return tourTagService.getTourTagListByValue(input);
    }

    public List<String> getAllTags() {
        return tourTagService.getTourTagList();
    }

    // ENGAGEMENT SERVICE ===========================
    public List<TourEngagement> getAllEngagements() {
        return tourEngagementService.getAllEngagements();
    }

    public List<TourEngagement> getAllEngagementsByUser(String userId) {
        return tourEngagementService.getAllEngagementsByUser(userId);
    }

    public List<TourEngagement> getAllEngagementsByTour(String tourId) {
        return tourEngagementService.getAllEngagementsByTour(tourId);
    }

    public TourEngagement getEngagementByFullValue(String userId, String tourId) {
        return tourEngagementService.getEngagementByFullValue(userId, tourId);
    }

    public TourEngagement updateEngagement(TourEngagement newValue) {
        return tourEngagementService.updateEngagement(newValue);
    }

    // ORDER SERVICE ================================
    public List<TourOrder> getAllTourOrders() {
        return tourOrderService.getAllTourOrders();
    }

    public List<TourOrder> getAllOrdersByUser(String userId) {
        return tourOrderService.getAllOrdersByUser(userId);
    }

    public List<TourOrder> getAllOrdersByInstance(String instanceId) {
        return tourOrderService.getAllOrdersByInstance(instanceId);
    }

    public TourOrder getOrderByFullValue(String userId, String instanceId) {
        return tourOrderService.getOrderByFullValue(userId, instanceId);
    }

    public TourOrder updateOrder(TourOrder newValue) {
        return tourOrderService.updateOrder(newValue);
    }


    // SUPPORTED ====================================
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