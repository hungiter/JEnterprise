package org.java_enterprise.backend.tour_service.storage.service;

import org.java_enterprise.backend.tour_service.storage.model.TourOrder;
import org.java_enterprise.backend.tour_service.storage.repository.TourOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TourOrderService {
    @Autowired
    private TourOrderRepository tourOrderRepository;

    Set<String> existingKeys = new HashSet<>();
    private final Map<String, List<TourOrder>> tourMap = new HashMap<>();
    private final Map<String, TourOrder> orderMap = new HashMap<>();
    private final Object lock = new Object();

    @Async("taskExecutor")
    @EventListener(ApplicationReadyEvent.class)
    public void initAsync() {
        System.out.println("TourOrderService.initAsync() - executed");
        fetchAllAndStore();
    }

    private String keyGenerate(String userId, String instanceId) {
        return userId + "|" + instanceId;
    }

    public void fetchAllAndStore() {
        synchronized (lock) {
            orderMap.clear();
            try {
                int page = 0;
                int size = 100; // chunk size
                Page<TourOrder> pageResult;
                do {
                    pageResult = tourOrderRepository.findAll(PageRequest.of(page, size));
                    List<TourOrder> orders = pageResult.getContent();
                    Map<String, List<TourOrder>> tmpMap = new HashMap<>();

                    for (TourOrder order : orders) {
                        String instanceId = order.getInstanceId();
                        try {
                            String tourCode = instanceId.split("_")[0];
                            if (tmpMap.containsKey(tourCode)) {
                                List<TourOrder> oldList = tmpMap.get(tourCode);
                                oldList.add(order);
                                tmpMap.replace(tourCode, oldList);
                            } else {
                                tmpMap.put(tourCode, List.of(order));
                            }
                        } catch (Exception e) {
                            System.out.println("Error on update tmpMap" + e);
                        }
                    }
                    for (Map.Entry<String, List<TourOrder>> entry : tmpMap.entrySet()) {
                        String entryKey = entry.getKey();
                        List<TourOrder> entryValue = entry.getValue();

                        if (!tourMap.containsKey(entryKey)) {
                            tourMap.put(entryKey, entryValue);
                        } else {
                            List<TourOrder> currOrders = tourMap.get(entryKey);
                            for (int i = 0; i < entryValue.size(); i++) {
                                TourOrder order = entryValue.get(i);
                                boolean exists = currOrders.stream()
                                        .anyMatch(oldValue -> Objects.equals(oldValue.getInstanceId(),
                                                order.getInstanceId())
                                                && Objects.equals(oldValue.getUsername(), order.getUsername()));
                                try {
                                    if (!exists) {
                                        currOrders.add(order);
                                    } else {
                                        currOrders.set(i, order);
                                    }
                                } catch (Exception e) {
                                    System.out.println("Lỗi ở đây " + e.getMessage());
                                }
                            }
                            tourMap.replace(entryKey, currOrders);
                        }

                        entryValue.forEach(order -> {
                            String key = keyGenerate(order.getUsername(), order.getInstanceId());
                            if (!orderMap.containsKey(key)) {
                                orderMap.put(key, order);
                            } else {
                                TourOrder currOrder = orderMap.get(key);
                                if (currOrder != null) {
                                    if (!Objects.equals(order.getStatus(), currOrder.getStatus())
                                            && order.getStatus() != null) {
                                        boolean upToDate = switch (order.getStatus()) {
                                            case "accept", "reject" ->
                                                !Objects.equals(currOrder.getStatus(), "pending");
                                            default -> true;
                                        };

                                        if (!upToDate) {
                                            orderMap.replace(key, order);
                                        }
                                    }
                                }
                            }
                        });
                    }
                    page++;
                } while (!pageResult.isLast());
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
        }
    }

    public List<TourOrder> getAllTourOrders() {
        List<TourOrder> result;
        synchronized (lock) {
            // Map Flatten to list
            result = tourMap.values()
                    .stream()
                    .flatMap(List::stream)
                    .toList();
        }
        return result.stream()
                .filter(Objects::nonNull)
                .toList();
    }

    public List<TourOrder> getAllOrdersByUser(String userId) {
        List<TourOrder> result = getAllTourOrders();
        if (userId == null || userId.isBlank()) {
            return result;
        }

        String keyword = userId.toLowerCase();
        return result.stream()
                .filter(order -> order != null && order.getUsername().toLowerCase().equals(keyword))
                .toList();
    }

    public List<TourOrder> getAllOrdersByInstance(String instanceId) {
        List<TourOrder> result = getAllTourOrders();
        if (instanceId == null || instanceId.isBlank()) {
            return result;
        }

        String keyword = instanceId.toLowerCase();
        return result.stream()
                .filter(order -> order != null && order.getInstanceId().toLowerCase().equals(keyword))
                .toList();
    }

    public TourOrder getOrderByFullValue(String userId, String instanceId) {
        if (instanceId == null || instanceId.isBlank() || userId == null || userId.isBlank()) {
            return null;
        } else {
            String key = keyGenerate(userId, instanceId);
            TourOrder order = orderMap.get(key);
            if (order == null) {
                order = tourOrderRepository.findTop1ByUsernameAndInstanceIdOrderByCreatedAtDesc(userId, instanceId);
                if (order != null) {
                    if (!orderMap.containsKey(key)) {
                        orderMap.put(key, order);
                    } else {
                        TourOrder currOrder = orderMap.get(key);
                        if (currOrder != null) {
                            if (!Objects.equals(order.getStatus(), currOrder.getStatus())
                                    && order.getStatus() != null) {
                                boolean upToDate = switch (order.getStatus()) {
                                    case "accept", "reject" -> !Objects.equals(currOrder.getStatus(), "pending");
                                    default -> true;
                                };

                                if (!upToDate) {
                                    orderMap.replace(key, order);
                                }
                            }
                        }
                    }
                }
            }
            return order;
        }
    }

    public TourOrder updateOrder(TourOrder newValue) {
        TourOrder existing = getOrderByFullValue(newValue.getUsername(), newValue.getInstanceId());
        if (existing != null) {
            existing.setStatus(newValue.getStatus());
            existing.setTotalTicket(newValue.getTotalTicket());
            existing.setTicketPrice(newValue.getTicketPrice());
            existing.setUpdatedAt(LocalDateTime.now());
            tourOrderRepository.save(existing);
            return existing;
        } else {
            newValue.setCreatedAt(LocalDateTime.now());
            tourOrderRepository.save(newValue);
            return newValue;
        }
    }
}
