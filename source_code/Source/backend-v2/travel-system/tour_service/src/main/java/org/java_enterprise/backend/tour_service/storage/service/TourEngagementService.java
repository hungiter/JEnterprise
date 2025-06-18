package org.java_enterprise.backend.tour_service.storage.service;

import jakarta.annotation.PostConstruct;
import org.java_enterprise.backend.tour_service.storage.model.Tag;
import org.java_enterprise.backend.tour_service.storage.model.TourEngagement;
import org.java_enterprise.backend.tour_service.storage.repository.TourEngagementRepository;
import org.java_enterprise.backend.tour_service.storage.repository.TourTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TourEngagementService {
    @Autowired
    private TourEngagementRepository tourEngagementRepository;

    Set<String> existingKeys = new HashSet<>();
    private final List<TourEngagement> engagementList = new ArrayList<>();
    private final Object lock = new Object();

    @Async("taskExecutor")
    @EventListener(ApplicationReadyEvent.class)
    public void initAsync() {
        System.out.println("TourEngagementService.initAsync() - executed");
        fetchAllAndStore();
    }

    private String keyGenerate(String userId, String tourId) {
        return userId + "|" + tourId;
    }

    public void fetchAllAndStore() {
        synchronized (lock) {
            engagementList.clear();
            int page = 0;
            int size = 100; // chunk size
            Page<TourEngagement> pageResult;
            do {
                pageResult = tourEngagementRepository.findAll(PageRequest.of(page, size));
                for (TourEngagement engagement : pageResult.getContent()) {
                    String key = keyGenerate(engagement.getUsername(), engagement.getTourId());
                    if (existingKeys.add(key)) { // only add if not already present
                        engagementList.add(engagement);
                    }
                }
                page++;
            } while (!pageResult.isLast());
        }
    }

    public List<TourEngagement> getAllEngagements() {
        List<TourEngagement> result;
        synchronized (lock) {
            result = new ArrayList<>(engagementList); // safe copy
        }
        return result.stream()
                .filter(Objects::nonNull)
                .toList();
    }

    public List<TourEngagement> getAllEngagementsByUser(String userId) {
        List<TourEngagement> result = getAllEngagements();
        if (userId == null || userId.isBlank()) {
            return result;
        }

        String keyword = userId.toLowerCase();
        return result.stream()
                .filter(engagement -> engagement != null && engagement.getUsername().toLowerCase().equals(keyword))
                .toList();
    }

    public List<TourEngagement> getAllEngagementsByTour(String tourId) {
        List<TourEngagement> result = getAllEngagements();
        if (tourId == null || tourId.isBlank()) {
            return result;
        }

        String keyword = tourId.toLowerCase();
        return result.stream()
                .filter(engagement -> engagement != null && engagement.getTourId().toLowerCase().equals(keyword))
                .toList();
    }


    public TourEngagement getEngagementByFullValue(String userId, String tourId) {
        List<TourEngagement> result = getAllEngagements();
        if (tourId == null || tourId.isBlank() || userId == null || userId.isBlank()) {
            return null;
        } else {
            String tKey = tourId.toLowerCase();
            String uKey = userId.toLowerCase();
            result = result.stream()
                    .filter(
                            engagement -> engagement != null
                                    && engagement.getTourId().toLowerCase().equals(tKey)
                                    && engagement.getUsername().toLowerCase().equals(uKey)
                    )
                    .toList();
            if (!result.isEmpty()) {
                return result.get(0);
            } else {
                TourEngagement engagement = tourEngagementRepository.findTop1ByUsernameAndTourIdOrderByLastAccessDesc(userId, tourId);
                if (engagement != null) {
                    String key = keyGenerate(engagement.getUsername(), engagement.getTourId());
                    if (existingKeys.add(key)) { // only add if not already present
                        engagementList.add(engagement);
                    }
                }
                return engagement;
            }
        }
    }

    public TourEngagement updateEngagement(TourEngagement newValue) {
        TourEngagement existing = getEngagementByFullValue(newValue.getUsername(), newValue.getTourId());
        if (existing != null) {
            existing.setTourId(newValue.getTourId());
            existing.setUsername(newValue.getUsername());
            existing.setStatus(newValue.getStatus());
            existing.setSessionId(newValue.getSessionId());
            existing.setLastAccess(System.currentTimeMillis());
            tourEngagementRepository.save(existing);
            return existing;
        } else {
            newValue.setLastAccess(System.currentTimeMillis());
            tourEngagementRepository.save(newValue);
            return newValue;
        }
    }
}
