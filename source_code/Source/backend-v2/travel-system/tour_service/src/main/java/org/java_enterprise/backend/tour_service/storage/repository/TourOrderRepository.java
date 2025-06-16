package org.java_enterprise.backend.tour_service.storage.repository;

import org.java_enterprise.backend.tour_service.storage.model.Tag;
import org.java_enterprise.backend.tour_service.storage.model.TourEngagement;
import org.java_enterprise.backend.tour_service.storage.model.TourOrder;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TourOrderRepository extends MongoRepository<TourOrder, String> {
    TourOrder findTop1ByUserIdAndInstanceIdOrderByCreatedAtDesc(String userId, String instanceId);
}
