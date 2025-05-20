package org.java_enterprise.backend.storage.service;

import jakarta.servlet.http.HttpServletRequest;
import org.java_enterprise.backend.storage.dto.PaymentInformationDTO;
import org.java_enterprise.backend.storage.dto.PaymentResponseDTO;

public interface IVnPayService {
    String createPaymentUrl(PaymentInformationDTO model, HttpServletRequest request);
    PaymentResponseDTO paymentExecute(HttpServletRequest request);
}
