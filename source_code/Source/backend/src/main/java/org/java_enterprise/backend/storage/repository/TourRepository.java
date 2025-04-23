package org.java_enterprise.backend.storage.repository;

import org.java_enterprise.backend.storage.model.Tour;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TourRepository extends MongoRepository<Tour, String> {
    Tour findByTourCode(String tourCode);
}
