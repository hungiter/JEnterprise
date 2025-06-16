package org.java_enterprise.backend.tour_service.storage.service;

import jakarta.annotation.PostConstruct;
import org.java_enterprise.backend.tour_service.storage.model.TourOrder;
import org.java_enterprise.backend.tour_service.storage.repository.TourOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TourOrderService {
    @Autowired
    private TourOrderRepository tourOrderRepository;

    Set<String> existingKeys = new HashSet<>();
    private final List<TourOrder> orderList = new ArrayList<>();
    private final Object lock = new Object();
    private volatile boolean initialized = false;

    @PostConstruct
    public void init() {
        fetchAllAndStore();
    }

    private String keyGenerate(String userId, String instanceId) {
        return userId + "|" + instanceId;
    }

    public void fetchAllAndStore() {
        synchronized (lock) {
            orderList.clear();
            int page = 0;
            int size = 100; // chunk size
            Page<TourOrder> pageResult;

            do {
                pageResult = tourOrderRepository.findAll(PageRequest.of(page, size));
                for (TourOrder order : pageResult.getContent()) {
                    String key = keyGenerate(order.getUserId(), order.getInstanceId());
                    if (existingKeys.add(key)) { // only add if not already present
                        orderList.add(order);
                    }
                }
                page++;
            } while (!pageResult.isLast());
            initialized = true;
        }
    }

    public List<TourOrder> getAllTourOrders() {
        List<TourOrder> result;
        synchronized (lock) {
            result = new ArrayList<>(orderList); // safe copy
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
                .filter(order -> order != null && order.getUserId().toLowerCase().equals(keyword))
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
        List<TourOrder> result = getAllTourOrders();
        if (instanceId == null || instanceId.isBlank() || userId == null || userId.isBlank()) {
            return null;
        } else {
            String iKey = instanceId.toLowerCase();
            String uKey = userId.toLowerCase();
            result = result.stream()
                    .filter(
                            order -> order != null
                                    && order.getInstanceId().toLowerCase().equals(iKey)
                                    && order.getUserId().toLowerCase().equals(uKey)
                    )
                    .toList();
            if (!result.isEmpty()) {
                return result.get(0);
            } else {
                TourOrder order = tourOrderRepository.findTop1ByUserIdAndInstanceIdOrderByCreatedAtDesc(userId, instanceId);
                if (order != null) {
                    String key = keyGenerate(order.getUserId(), order.getInstanceId());
                    if (existingKeys.add(key)) { // only add if not already present
                        orderList.add(order);
                    }
                }
                return order;
            }
        }
    }

    public TourOrder updateOrder(TourOrder newValue) {
        TourOrder existing = getOrderByFullValue(newValue.getUserId(), newValue.getInstanceId());
        if (existing != null) {
            existing.setUserId(newValue.getUserId());
            existing.setInstanceId(newValue.getInstanceId());
            existing.setStatus(newValue.getStatus());
            existing.setTotalTicket(newValue.getTotalTicket());

            existing.setCreateAt(System.currentTimeMillis());
            existing.setValidateAt(System.currentTimeMillis());
            tourOrderRepository.save(existing);
            return existing;
        } else {
            newValue.setCreateAt(System.currentTimeMillis());
            newValue.setValidateAt(System.currentTimeMillis());
            tourOrderRepository.save(newValue);
            return newValue;
        }
    }
}
