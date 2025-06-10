package org.java_enterprise.backend.tour_service.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class TourInstanceSummaryDTO {
    private String instanceId;
    private String tourId;
    private String startDate;
}
