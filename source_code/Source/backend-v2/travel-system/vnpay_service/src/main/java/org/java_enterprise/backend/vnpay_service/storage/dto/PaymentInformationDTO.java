package org.java_enterprise.backend.vnpay_service.storage.dto;

import lombok.Data;

@Data
public class PaymentInformationDTO {
    private String orderType;
    private double amount;
    private String orderDescription;
    private String name;
    private String tourCode;
    private String ip;
}