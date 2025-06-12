package org.java_enterprise.backend.tour_service.storage.repository;

import org.java_enterprise.backend.tour_service.storage.model.TourEngagement;
import org.java_enterprise.backend.tour_service.storage.model.TourInstance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TourEngagementRepository extends MongoRepository<TourEngagement, String> {
    List<TourEngagement> findByUserId(String userId);

    List<TourEngagement> findBySessionId(String sessionId);
}

