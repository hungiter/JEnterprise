package org.java_enterprise.backend.tour_service.storage.service;

import jakarta.annotation.PostConstruct;
import org.java_enterprise.backend.tour_service.storage.data.TagFoundResponseDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.Tag;
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
public class TourTagService {
    @Autowired
    private TourTagRepository tourTagRepository;

    private final List<String> tagList = new ArrayList<>();
    private final Map<String, Set<String>> tagMatrix = new HashMap<>();
    private final Object lock = new Object();

    @Async("taskExecutor")
    @EventListener(ApplicationReadyEvent.class)
    public void initAsync() {
        System.out.println("TourTagService.initAsync() - executed");
        fetchAllAndStore();
    }

    public void fetchAllAndStore() {
        synchronized (lock) {
            tagList.clear();

            // FETCHING TAG
            int page = 0;
            int size = 10000; // chunk size
            Page<Tag> pageResult;

            // SETTINGS
            int minLen = 1;
            int maxLen = 16;
            System.out.println("Start Create TAG DICTIONARY");
            do {
                System.out.println("TAG DICTIONARY PAGE - " + (page + 1));
                pageResult = tourTagRepository.findAll(PageRequest.of(page, size));
                List<String> values = pageResult.getContent()
                        .stream()
                        .map(Tag::getValue)
                        .toList();
                tagList.addAll(values.stream().filter(tag -> tag.length() <= maxLen).toList());
                page++;
            } while (!pageResult.isLast());
            System.out.println("Created TAG DICTIONARY SUCCESS");

            // CREATING TAG MATRIX
            System.out.println("Start Create TAG MATRIX");
            Map<String, Set<String>> matrix = new HashMap<>();

            for (String tag : tagList) {
                Set<String> seenSubstrings = new HashSet<>();
                String tLower = tag.toLowerCase();  // chỉ toLower 1 lần
                int n = tag.length();

                for (int i = 0; i < n; i++) {
                    for (int j = i + minLen; j <= Math.min(n, i + maxLen); j++) {
                        String substring = tag.substring(i, j).toLowerCase();
                        if (seenSubstrings.add(substring)) {
                            matrix.computeIfAbsent(substring, k -> new HashSet<>())
                                    .add(tLower);
                        }
                    }
                }
            }
            tagMatrix.putAll(matrix);
            System.out.println("Created TAG MATRIX SUCCESS");
        }
    }

    public List<String> getTourTagList() {
        List<String> result;
        synchronized (lock) {
            result = new ArrayList<>(tagList); // safe copy
        }
        if (result.isEmpty()) {
            return Collections.emptyList();
        }

        return result.subList(0, Math.min(100, result.size()));
//        return result.stream()
//                .filter(tag -> tag != null && tag.split(" ").length < 3)
//                .toList();
    }

    public TagFoundResponseDTO getTourTagListByValue(String input) {
        if (tagMatrix.isEmpty()) {
            return TagFoundResponseDTO.creatErrorResponse("Chưa tạo ma trận từ khoá.");
        }
        Set<String> tags = tagMatrix.get(input);
        if (tags == null || tags.isEmpty()) {
            return TagFoundResponseDTO.creatErrorResponse("Không tìm thấy từ khoá.");
        }

        return TagFoundResponseDTO.createSuccessResponse(tags.stream().toList());
    }
}
