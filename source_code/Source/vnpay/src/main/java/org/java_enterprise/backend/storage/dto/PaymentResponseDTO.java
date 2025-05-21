package org.java_enterprise.backend.storage.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {
    private boolean success;
    private String tourCode;
    private String orderId;
    private String transactionId;
    private String paymentId;
    private String orderDescription;
    private String paymentMethod;
    private String vnPayResponseCode;
    private String token;
}