package org.java_enterprise.backend.storage.service;

import org.java_enterprise.backend.storage.model.Tour;
import org.java_enterprise.backend.storage.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}