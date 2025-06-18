package org.java_enterprise.backend.tour_service.storage.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequestDTO {
    private String instanceId;
    private String username;
    private Integer totalTicket;
}