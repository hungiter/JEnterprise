package org.java_enterprise.backend.tour_service.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Data
@AllArgsConstructor
public class TourInstanceDTO {
    private String instanceId;
    private String tourId;
    private String startDate;
    private Integer totalSlot;
    private Integer remainingSlot;
    private String status;
    private List<String> guiderIds;
}

