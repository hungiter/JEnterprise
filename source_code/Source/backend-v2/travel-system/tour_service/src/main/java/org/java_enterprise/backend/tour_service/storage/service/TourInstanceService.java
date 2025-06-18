package org.java_enterprise.backend.tour_service.storage.service;

import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourInstanceSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.dto.TourSummaryDTO;
import org.java_enterprise.backend.tour_service.storage.model.Tag;
import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.java_enterprise.backend.tour_service.storage.model.TourEngagement;
import org.java_enterprise.backend.tour_service.storage.model.TourInstance;
import org.java_enterprise.backend.tour_service.storage.repository.TourInstanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TourInstanceService {
    @Autowired
    private TourInstanceRepository tourInstanceRepository;

    Set<String> existingKeys = new HashSet<>();
    private final Map<String, List<TourInstance>> instanceMap = new HashMap<>();
    private final Map<String, TourInstance> instanceIdMap = new HashMap<>();
    private final Map<String, List<TourInstanceSummaryDTO>> summaryMap = new HashMap<>();
    private final Object lock = new Object();

    @Async("taskExecutor")
    @EventListener(ApplicationReadyEvent.class)
    public void initAsync() {
        System.out.println("TourInstanceService.initAsync() - executed");
        fetchAllAndStore();
    }

    public void fetchAllAndStore() {
        synchronized (lock) {
            instanceMap.clear();
            int page = 0;
            int size = 100; // chunk size
            Page<TourInstance> pageResult;
            String dateStr = LocalDate.now().plusDays(4).toString(); // At least 4 day before RUNNING

            do {
                pageResult = tourInstanceRepository.findAll(PageRequest.of(page, size));
                List<TourInstance> instances = pageResult.getContent();

                Map<String, List<TourInstance>> tmpMap = new HashMap<>();
                for (TourInstance instance : instances) {
                    LocalDate targetDate = LocalDate.parse(dateStr);
                    LocalDate startDate = LocalDate.parse(instance.getStartDate());
                    if (tmpMap.containsKey(instance.getTourId()) && Objects.equals(instance.getStatus(), "PENDING") && startDate.isBefore(targetDate)) {
                        List<TourInstance> oldList = new ArrayList<>(tmpMap.get(instance.getTourId()));
                        oldList.add(instance);
                        tmpMap.replace(instance.getTourId(), oldList);
                    } else {
                        tmpMap.put(instance.getTourId(), List.of(instance));
                    }
                }

                for (Map.Entry<String, List<TourInstance>> entry : tmpMap.entrySet()) {
                    String key = entry.getKey();
                    List<TourInstance> value = entry.getValue();

//                    System.out.println("Added " + value.size() + " instances of " + key);
                    List<TourInstanceSummaryDTO> summaries = value.stream().map(tour -> new TourInstanceSummaryDTO(
                            tour.getInstanceId(),
                            tour.getTourId(),
                            tour.getStartDate()
                    )).toList();
                    if (existingKeys.add(key)) {
                        instanceMap.put(key, value);
                        summaryMap.put(key, summaries);
                    } else {
                        List<TourInstance> currInstances = new ArrayList<>(instanceMap.get(key));
                        List<TourInstanceSummaryDTO> currSummaries = new ArrayList<>(summaryMap.get(key));
                        for (int i = 0; i < value.size(); i++) {
                            TourInstance instance = value.get(i);
                            TourInstanceSummaryDTO summary = summaries.get(i);
                            boolean exists = currInstances.stream()
                                    .anyMatch(oldValue -> Objects.equals(oldValue.getInstanceId(), instance.getInstanceId()));
                            try {
                                if (!exists) {
                                    currInstances.add(instance);
                                    currSummaries.add(summary);
                                } else {
                                    currInstances.set(i, instance);
                                    currSummaries.set(i, summary);
                                }
                            } catch (Exception e) {
                                System.out.println("Lỗi ở đây " + e.getMessage());
                            }
                        }


                        instanceMap.replace(key, currInstances.stream().toList());
                        summaryMap.replace(key, currSummaries.stream().toList());
                    }


                    value.forEach(instance -> {
                        String id = instance.getInstanceId();
                        if (!instanceIdMap.containsKey(id)) {
                            instanceIdMap.put(id, instance);
                        }
                    });
                }

                page++;
            } while (!pageResult.isLast());
        }
    }

    public List<TourInstanceSummaryDTO> getValidTourInstances(String tourCode) {
        List<TourInstanceSummaryDTO> summaries = new ArrayList<>();
        synchronized (lock) {
            if (existingKeys.add(tourCode)) {
                LocalDate targetDate = LocalDate.now().plusDays(4);
                List<TourInstance> instances = tourInstanceRepository.findByTourId(tourCode).stream().filter(instance -> {
                            boolean isPending = Objects.equals(instance.getStatus(), "PENDING");

                            LocalDate startDate;
                            try {
                                startDate = LocalDate.parse(instance.getStartDate());
                            } catch (Exception e) {
                                return false; // nếu date sai format thì bỏ qua luôn
                            }

                            return isPending && startDate.isBefore(targetDate);
                        })
                        .toList();
                if (!instances.isEmpty()) {
//                    System.out.println("Added " + instances.size() + " instances of " + tourCode);
                    instanceMap.put(tourCode, instances);
                    summaryMap.put(tourCode, instances.stream().map(tour -> new TourInstanceSummaryDTO(
                            tour.getInstanceId(),
                            tour.getTourId(),
                            tour.getStartDate()
                    )).collect(Collectors.toList()));
                    instances.forEach(instance -> {
                        String id = instance.getInstanceId();
                        if (!instanceIdMap.containsKey(id)) {
                            instanceIdMap.put(id, instance);
                        }
                    });
                }
            } else {
                summaries = new ArrayList<>(summaryMap.get(tourCode));
            }
        }

        return summaries;
    }

    public Optional<TourInstanceDTO> getTourInstanceInfo(String instanceId) {
        TourInstance tourInstance = instanceIdMap.get(instanceId);
        if (tourInstance != null) {
            return Optional.of(mapToDTO(tourInstance));
        }

        return tourInstanceRepository.findByInstanceId(instanceId)
                .map(this::mapToDTO);
    }

    // SUPPORT
    public TourInstanceDTO mapToDTO(TourInstance entity) {
        return new TourInstanceDTO(
                entity.getInstanceId(),
                entity.getTourId(),
                entity.getStartDate(),
                entity.getTotalSlot(),
                entity.getRemainingSlot(),
                entity.getStatus(),
                entity.getGuiderIds()
        );
    }

}