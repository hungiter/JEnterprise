package org.java_enterprise.backend.vnpay_service.storage.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.java_enterprise.backend.vnpay_service.storage.dto.PaymentInformationDTO;
import org.java_enterprise.backend.vnpay_service.storage.dto.PaymentResponseDTO;
import org.java_enterprise.backend.vnpay_service.storage.dto.TestCardDTO;
import org.java_enterprise.backend.vnpay_service.storage.service.VnPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pay")
public class VnPayController {

    @Autowired
    private VnPayService vnPayService;

    @GetMapping("/get-all-test-cards")
    private List<TestCardDTO> getAllTestCards() {
        return TestCardDTO.testCardList();
    }

    @PostMapping("/create-url")
    public String createPaymentUrl(@RequestBody PaymentInformationDTO paymentInfo, HttpServletRequest request) {
        return vnPayService.createPaymentUrl(paymentInfo, request);
    }

    //    @GetMapping("/execute")
//    public PaymentResponseDTO paymentExecute(HttpServletRequest request) {
//        return vnPayService.paymentExecute(request);
//    }
    @GetMapping("/execute")
    public ResponseEntity<?> paymentExecute(HttpServletRequest request) {
        PaymentResponseDTO result = vnPayService.paymentExecute(request);
        // String redirectUrl = "http://pure-calf-lively.ngrok-free.app/tours/" + result.getTourCode();
        String redirectUrl = "http://pure-calf-lively.ngrok-free.app/payment-result?success=" + result.isSuccess() + "&&tourCode=" + result.getTourCode();
        return ResponseEntity.status(HttpStatus.FOUND).header("Location", redirectUrl).build();
//        // Sau khi xử lý, redirect về frontend kèm trạng thái
//        String redirectUrl = "http://pure-calf-lively.ngrok-free.app/payment-result?success=" + result.isSuccess() + "&&tourCode=" + result.getTourCode();
//        String redirectUrl = "http://localhost:5173/payment-result?success=" + result.isSuccess() + "&&tourCode=" + result.getTourCode();
//        return ResponseEntity.status(HttpStatus.FOUND).header("Location", redirectUrl).build();
    }
}

