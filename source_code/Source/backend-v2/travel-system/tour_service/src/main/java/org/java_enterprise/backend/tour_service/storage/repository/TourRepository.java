package org.java_enterprise.backend.tour_service.storage.repository;

import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TourRepository extends MongoRepository<Tour, String> {
    Tour findByTourCode(String tourCode);

    List<Tour> findByTourCodeIn(List<String> tourCodes);
}
