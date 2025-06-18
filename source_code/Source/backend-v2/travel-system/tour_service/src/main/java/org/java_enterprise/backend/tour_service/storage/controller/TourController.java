package org.java_enterprise.backend.tour_service.storage.controller;

import org.java_enterprise.backend.tour_service.storage.data.*;
import org.java_enterprise.backend.tour_service.storage.dto.TourDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.java_enterprise.backend.tour_service.storage.model.TourEngagement;
import org.java_enterprise.backend.tour_service.storage.model.TourOrder;
import org.java_enterprise.backend.tour_service.storage.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    @Autowired
    private TourService tourService;

    @PostMapping("/save")
    public String saveTours(@RequestBody List<Tour> tours) {
        tourService.saveTours(tours);
        return "Saved!";
    }

    @GetMapping("/{code}")
    public TourDTO getTour(@PathVariable("code") String code) {
        return tourService.getTourByCode(code);
    }

    @GetMapping("/")
    public List<Tour> getAllTours() {
        List<Tour> result = tourService.getAllTours();
        System.out.println("Currently have " + result.size() + " tours");
        return result;
    }

    @GetMapping("/summary")
    public List<TourSummaryDTO> getAllTourSummaries() {
        try {
            List<TourSummaryDTO> result = tourService.getAllTourSummaries();
            System.out.println("TourSummary: " + result);
            return result;
        } catch (Exception e) {
            System.out.println("Error get data" + e);
            return Collections.emptyList();
        }
    }

    @PostMapping("/summary_tours")
    public List<TourSummaryDTO> getSummaryTours(@RequestBody SummaryToursRequestDTO request) {
        return tourService.getTourSummeries(request.getTour_codes());
    }


    // INSTANCE CONTROLLER================================
    @GetMapping("/instances/all/{tourCode}")
    public List<TourInstanceSummaryDTO> getTourInstanceSummaries(@PathVariable("tourCode") String tourCode) {
        return tourService.getTourInstanceSummaries(tourCode);
    }

    @GetMapping("/instances/info/{instanceId}")
    public Optional<TourInstanceDTO> getTourInstanceInfo(@PathVariable("instanceId") String instanceId) {
        return tourService.getInstanceInfo(instanceId);
    }

    // TAG CONTROLLER=======================================
    @GetMapping("/tags")
    public List<String> getAllTags() {
        return tourService.getAllTags();
    }

    @GetMapping("/tags/find")
    public List<String> getTagsByString(@RequestParam("input") String input) {
        return tourService.getTagByString(input);
    }

    // ENGAGEMENT CONTROLLER================================
    @GetMapping("/engagement")
    public List<TourEngagement> getAllEngagements() {
        return tourService.getAllEngagements();
    }

    @GetMapping("/engagement/find")
    public List<TourEngagement> findEngagements(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String tourId
    ) {
        if (username != null && tourId != null) {
            TourEngagement engagement = tourService.getEngagementByFullValue(username, tourId);
            if (engagement != null) {
                return List.of(engagement);
            }
        } else {
            if (tourId != null) {
                return tourService.getAllEngagementsByTour(tourId);
            }

            if (username != null) {
                return tourService.getAllEngagementsByUser(username);
            }
        }

        return Collections.emptyList();
    }

    @PutMapping("/engagement")
    public TourEngagement updateEngagement(@RequestBody TourEngagement newValue) {
        return tourService.updateEngagement(newValue);
    }

    // ORDER CONTROLLER=====================================
    @GetMapping("/order")
    public List<TourOrder> getAllTourOrders() {
        return tourService.getAllTourOrders();
    }

    @GetMapping("/order/find")
    public List<TourOrder> findOrders(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String instanceId
    ) {
        if (username != null && instanceId != null) {
            return List.of(tourService.getOrderByFullValue(username, instanceId));
        }

        if (instanceId != null) {
            return tourService.getAllOrdersByInstance(instanceId);
        }

        if (username != null) {
            return tourService.getAllOrdersByUser(username);
        }

        return Collections.emptyList();
    }

    // ORDER CONTROLLER ===================================
    @PostMapping("/order/create")
    public OrderCreateReponseDTO createOrder(@RequestBody OrderCreateRequestDTO request) {
        return tourService.createOrder(request);
    }

    @PutMapping("/order/accept")
    public OrderPaidReponseDTO acceptOrder(@RequestBody OrderPaidRequestDTO request) {
        return tourService.acceptOrder(request);
    }

    @PutMapping("/order/reject")
    public OrderPaidReponseDTO rejectOrder(@RequestBody OrderPaidRequestDTO request) {
        return tourService.rejectOrder(request);
    }
}