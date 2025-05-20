package org.java_enterprise.backend.storage.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.java_enterprise.backend.storage.dto.PaymentInformationDTO;
import org.java_enterprise.backend.storage.dto.PaymentResponseDTO;
import org.java_enterprise.backend.storage.dto.TestCardDTO;
import org.java_enterprise.backend.storage.service.VnPayService;
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
    private List<TestCardDTO> getAllTestCards(){
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

        // Sau khi xử lý, redirect về frontend kèm trạng thái
//        String redirectUrl = "http://localhost:3000/payment-result?success=" + result.isSuccess();
        String redirectUrl = "https://google.com";
        return ResponseEntity.status(HttpStatus.FOUND).header("Location", redirectUrl).build();
    }
}

