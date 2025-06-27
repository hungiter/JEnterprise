package org.java_enterprise.backend.tour_service.storage.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.java_enterprise.backend.tour_service.storage.model.TourOrder;

@Data
@Builder
@AllArgsConstructor
public class OrderPaidReponseDTO {
    private boolean success;
    private String message;
    private TourOrder tourOrder;
}
