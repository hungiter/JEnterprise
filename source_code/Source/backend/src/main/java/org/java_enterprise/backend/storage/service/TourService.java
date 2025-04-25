package org.java_enterprise.backend.storage.service;

import org.java_enterprise.backend.storage.dto.TourSummaryDTO;
import org.java_enterprise.backend.storage.model.Tour;
import org.java_enterprise.backend.storage.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TourService {
    @Autowired
    private TourRepository tourRepository;

    public void saveTours(List<Tour> tours) {
        tourRepository.saveAll(tours);
    }

    public Tour getTourByCode(String code) {
        return tourRepository.findByTourCode(code);
    }

    public List<Tour> getAllTours() {
        return tourRepository.findAll();
    }

    public List<TourSummaryDTO> getAllTourSummaries() {
        return tourRepository.findAll().stream().map(tour ->
                new TourSummaryDTO(
                        tour.getTourCode(),
                        tour.getThumbnail(),
                        tour.getTitle(),
                        tour.getDeparture(),
                        tour.getDuration(),
                        tour.getVehicle(),
                        tour.getPrice(),
                        tour.getPriceValue(),
                        tour.getTag(),
                        tour.getCalendar()
                )
        ).collect(Collectors.toList());
    }

}