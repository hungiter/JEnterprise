package org.java_enterprise.backend.tour_service.storage.service;

import jakarta.annotation.PostConstruct;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.Tag;
import org.java_enterprise.backend.tour_service.storage.repository.TourTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TourTagService {
    @Autowired
    private TourTagRepository tourTagRepository;

    private final List<String> tagList = new ArrayList<>();
    private final Object lock = new Object();

    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void initAsync() {
        fetchAllAndStore();
    }

    public void fetchAllAndStore() {
        synchronized (lock) {
            tagList.clear();
            int page = 0;
            int size = 100; // chunk size
            Page<Tag> pageResult;

            do {
                pageResult = tourTagRepository.findAll(PageRequest.of(page, size));
                List<String> values = pageResult.getContent()
                        .stream()
                        .map(Tag::getValue)
                        .toList();
                tagList.addAll(values);
                page++;
            } while (!pageResult.isLast());
        }
    }

    public List<String> getTourTagList(boolean refreshFromDb) {
        if (refreshFromDb) {
            fetchAllAndStore();
        }

        synchronized (lock) {
            return new ArrayList<>(tagList); // safe copy
        }
    }

    public List<String> getTourTagList() {
        List<String> result = getTourTagList(false);
        return result.stream()
                .filter(tag -> tag != null && tag.split(" ").length < 3)
                .toList();
    }

    public List<String> getTourTagListByValue(String input) {
        List<String> result = getTourTagList();
        if (input == null || input.isBlank()) {
            return result;
        }

        String keyword = input.toLowerCase();
        return result.stream()
                .filter(tag -> tag != null && tag.toLowerCase().contains(keyword))
                .toList();
    }
}
