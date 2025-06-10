package org.java_enterprise.backend.tour_service.storage.service;

import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.TourInstance;
import org.java_enterprise.backend.tour_service.storage.repository.TourInstanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TourInstanceService {
    @Autowired
    private TourInstanceRepository tourInstanceRepository;

    public List<TourInstanceSummaryDTO> getValidTourInstances(String tourCode) {
        String dateStr = LocalDate.now().plusDays(4).toString(); // At least 4 day before RUNNING
        // Lấy tất cả các tour có tourCode nằm trong danh sách tour_codes
        return tourInstanceRepository.findByStartDateGreaterThanEqualAndStatus(dateStr,"PENDING").stream()
                .map(tour -> new TourInstanceSummaryDTO(
                        tour.getInstanceId(),
                        tour.getTourId(),
                        tour.getStartDate()
                ))
                .collect(Collectors.toList());
    }

    public Optional<TourInstanceDTO> getTourInstanceInfo(String instanceId) {
        return tourInstanceRepository.findByInstanceId(instanceId)
                .map(this::mapToDTO);
    }

    // SUPPORT
    public TourInstanceDTO mapToDTO(TourInstance entity) {
        return new TourInstanceDTO(
                entity.getInstanceId(),
                entity.getTourId(),
                entity.getStartDate(),
                entity.getTotalSlot(),
                entity.getRemainingSlot(),
                entity.getStatus(),
                entity.getGuiderIds()
        );
    }

}