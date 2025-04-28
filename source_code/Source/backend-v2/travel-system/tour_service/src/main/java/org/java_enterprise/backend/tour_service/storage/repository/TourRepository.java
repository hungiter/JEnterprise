package org.java_enterprise.backend.tour_service.storage.repository;

import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TourRepository extends MongoRepository<Tour, String> {
    Tour findByTourCode(String tourCode);
}
