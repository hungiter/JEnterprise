package org.java_enterprise.backend.tour_service.storage.controller;

import org.java_enterprise.backend.tour_service.storage.dto.TourSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.SummaryToursRequest;
import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.java_enterprise.backend.tour_service.storage.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public Tour getTour(@PathVariable("code") String code) {
        return tourService.getTourByCode(code);
    }

    @GetMapping
    public List<Tour> getAllTours() {
        List<Tour> result = tourService.getAllTours();
        System.out.println("Currently have " + result.size() + " tours");
        return result;
    }

    @GetMapping("/summary")
    public List<TourSummaryDTO> getAllTourSummaries() {
        return tourService.getAllTourSummaries();
    }

    @PostMapping("/summary_tours")
    public List<TourSummaryDTO> getSummaryTours(@RequestBody SummaryToursRequest request) {
        return tourService.getTourSummeries(request.getTour_codes());
    }
}