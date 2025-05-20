package org.java_enterprise.backend.storage.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vnpay_transactions")
public class VnPayTransaction {

    @Id
    private String id;

    private String orderDescription;
    private String transactionId;
    private String orderId;
    private String paymentMethod;
    private String paymentId;
    private boolean success;
    private String token;
    private String vnPayResponseCode;

    private LocalDateTime createdAt;
}
