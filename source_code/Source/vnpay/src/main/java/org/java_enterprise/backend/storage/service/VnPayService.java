package org.java_enterprise.backend.storage.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.java_enterprise.backend.storage.dto.PaymentInformationDTO;
import org.java_enterprise.backend.storage.dto.PaymentResponseDTO;
import org.java_enterprise.backend.storage.utils.Utils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
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

    public String createPaymentUrl(PaymentInformationDTO model, HttpServletRequest request) {
        ZonedDateTime timeNow = ZonedDateTime.now(ZoneId.of(timeZoneId));
        String formattedDate = timeNow.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String tick = String.valueOf(System.currentTimeMillis());

        VnPayLibrary pay = new VnPayLibrary();

        pay.addRequestData("vnp_Version", version);
        pay.addRequestData("vnp_Command", command);
        pay.addRequestData("vnp_TmnCode", tmnCode);
        pay.addRequestData("vnp_Amount", String.valueOf((int) model.getAmount() * 100));
        pay.addRequestData("vnp_CreateDate", formattedDate);
        pay.addRequestData("vnp_CurrCode", currCode);
        pay.addRequestData("vnp_IpAddr", getClientIpAddr(request));
        pay.addRequestData("vnp_Locale", locale);
        pay.addRequestData("vnp_OrderInfo", model.getName() + " " + model.getOrderDescription() + " " + model.getAmount());
        pay.addRequestData("vnp_OrderType", model.getOrderType());
        pay.addRequestData("vnp_ReturnUrl", returnUrl);
        pay.addRequestData("vnp_TxnRef", tick);

        return pay.createRequestUrl(baseUrl, hashSecret);
    }

    public PaymentResponseDTO paymentExecute(HttpServletRequest request) {
        Map<String, String[]> paramMap = request.getParameterMap();
        MultiValueMap<String, String> multiValueMap = Utils.convertToMultiValueMap(paramMap);
        return new VnPayLibrary().getFullResponseData(multiValueMap, hashSecret);
    }

    public void createPaymentIPN(){}

    private String getClientIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
