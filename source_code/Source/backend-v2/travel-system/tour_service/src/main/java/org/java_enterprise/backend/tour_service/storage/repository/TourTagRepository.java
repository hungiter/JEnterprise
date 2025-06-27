package org.java_enterprise.backend.tour_service.storage.repository;

import org.java_enterprise.backend.tour_service.storage.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TourTagRepository extends MongoRepository<Tag, String> {
}
