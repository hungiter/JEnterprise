package org.java_enterprise.backend.storage.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.java_enterprise.backend.storage.dto.PaymentInformationDTO;
import org.java_enterprise.backend.storage.dto.PaymentResponseDTO;
import org.java_enterprise.backend.storage.utils.Utils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VnPayService implements IVnPayService {

    @Value("${vnpay.version}")
    private String version;

    @Value("${vnpay.command}")
    private String command;

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.currCode}")
    private String currCode;

    @Value("${vnpay.locale}")
    private String locale;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.baseUrl}")
    private String baseUrl;

    @Value("${payment-callback.returnUrl}")
    private String returnUrl;

    @Value("${timezone.id}")
    private String timeZoneId;

    private Map<String, String> tourOrderMap = new HashMap<>();

    public String createPaymentUrl(PaymentInformationDTO model, HttpServletRequest request) {
        ZonedDateTime timeNow = ZonedDateTime.now(ZoneId.of(timeZoneId));
        String formattedDate = timeNow.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String tick = String.valueOf(System.currentTimeMillis());
        String ip = "";
        if(model.getIp().isEmpty()){
            ip = getClientIpAddr(request);
        }else{
            ip = model.getIp();
        }

        VnPayLibrary pay = new VnPayLibrary();

        pay.addRequestData("vnp_Version", version);
        pay.addRequestData("vnp_Command", command);
        pay.addRequestData("vnp_TmnCode", tmnCode);
        pay.addRequestData("vnp_Amount", String.valueOf((int) model.getAmount() * 100));
        pay.addRequestData("vnp_CreateDate", formattedDate);
        pay.addRequestData("vnp_CurrCode", currCode);
        pay.addRequestData("vnp_IpAddr", ip);
        pay.addRequestData("vnp_Locale", locale);
        pay.addRequestData("vnp_OrderInfo", model.getName() + " " + model.getOrderDescription() + " " + model.getAmount());
        pay.addRequestData("vnp_OrderType", model.getOrderType());
        pay.addRequestData("vnp_ReturnUrl", returnUrl);
        pay.addRequestData("vnp_TxnRef", tick);


        // Request Process
        String requestUrl = pay.createRequestUrl(baseUrl, hashSecret);
        String orderId = pay.getQueryParam(requestUrl, "vnp_TxnRef");
        if (!model.getTourCode().isEmpty() && !orderId.isEmpty()) {
            tourOrderMap.put(orderId, model.getTourCode());
            System.out.println(model.getTourCode() + "||" + orderId);
        }
        return requestUrl;
    }

    public PaymentResponseDTO paymentExecute(HttpServletRequest request) {
        Map<String, String[]> paramMap = request.getParameterMap();
        MultiValueMap<String, String> multiValueMap = Utils.convertToMultiValueMap(paramMap);
        PaymentResponseDTO paymentResponse = new VnPayLibrary().getFullResponseData(multiValueMap, hashSecret);
        String orderId = paymentResponse.getOrderId();
        String tourCode = tourOrderMap.getOrDefault(orderId, "");
        System.out.println(tourCode + "||" + orderId);
        tourOrderMap.remove(orderId);
        paymentResponse.setTourCode(tourCode);
        return paymentResponse;
    }

    private String getClientIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
