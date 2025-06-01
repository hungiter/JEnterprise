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
    private String username;
    private String tourCode;
    private String orderDescription;
    private String status;
    private Long createAtEpoch; // epoch
    private Long expireAtEpoch; // epoch
    private LocalDateTime createdAt;
    private LocalDateTime expireAt;
}
