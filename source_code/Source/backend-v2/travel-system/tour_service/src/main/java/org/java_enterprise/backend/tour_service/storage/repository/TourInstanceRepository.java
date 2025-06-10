package org.java_enterprise.backend.tour_service.storage.repository;

import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.java_enterprise.backend.tour_service.storage.model.TourInstance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TourInstanceRepository extends MongoRepository<TourInstance, String> {
    List<TourInstance> findByStartDateGreaterThanEqualAndStatus(String startDate, String status);
    Optional<TourInstance> findByInstanceId(String instanceId);
}

