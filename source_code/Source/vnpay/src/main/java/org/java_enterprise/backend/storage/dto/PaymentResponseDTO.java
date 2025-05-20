package org.java_enterprise.backend.storage.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {
    private String orderDescription;
    private String transactionId;
    private String orderId;
    private String paymentMethod;
    private String paymentId;
    private boolean success;
    private String token;
    private String vnPayResponseCode;
}