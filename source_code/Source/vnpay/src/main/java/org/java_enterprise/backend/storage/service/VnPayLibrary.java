package org.java_enterprise.backend.storage.service;


import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import org.java_enterprise.backend.storage.dto.PaymentResponseDTO;
import org.springframework.util.MultiValueMap;

import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

public class VnPayLibrary {

    private final SortedMap<String, String> requestData = new TreeMap<>(new VnPayCompare());
    private final SortedMap<String, String> responseData = new TreeMap<>(new VnPayCompare());

    public PaymentResponseDTO getFullResponseData(MultiValueMap<String, String> queryParams, String hashSecret) {
        VnPayLibrary vnPay = new VnPayLibrary();
        for (String key : queryParams.keySet()) {
            if (key != null && key.startsWith("vnp_")) {
                vnPay.addResponseData(key, queryParams.getFirst(key));
            }
        }

        String orderId = vnPay.getResponseData("vnp_TxnRef");
        String transactionId = vnPay.getResponseData("vnp_TransactionNo");
        String vnpResponseCode = vnPay.getResponseData("vnp_ResponseCode");
        String vnpSecureHash = queryParams.getFirst("vnp_SecureHash");
        String orderInfo = vnPay.getResponseData("vnp_OrderInfo");

        boolean isValid = vnPay.validateSignature(vnpSecureHash, hashSecret);

        if (!isValid) {
            return PaymentResponseDTO.builder()
                    .success(false)
                    .build();
        }

        return PaymentResponseDTO.builder()
                .success("00".equals(vnpResponseCode))
                .paymentMethod("VnPay")
                .orderDescription(orderInfo)
                .orderId(orderId)
                .paymentId(transactionId)
                .transactionId(transactionId)
                .token(vnpSecureHash)
                .vnPayResponseCode(vnpResponseCode)
                .build();
    }

    public String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            try {
                ipAddress = InetAddress.getLocalHost().getHostAddress();
            } catch (UnknownHostException e) {
                return "127.0.0.1";
            }
        }
        return ipAddress;
    }

    public void addRequestData(String key, String value) {
        if (value != null && !value.isEmpty()) {
            requestData.put(key, value);
        }
    }

    public void addResponseData(String key, String value) {
        if (value != null && !value.isEmpty()) {
            responseData.put(key, value);
        }
    }

    public String getResponseData(String key) {
        return responseData.getOrDefault(key, "");
    }

    public String createRequestUrl(String baseUrl, String secretKey) {
        StringBuilder data = new StringBuilder();
        for (Map.Entry<String, String> entry : requestData.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                data.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                        .append("&");
            }
        }

        String queryString = data.toString();
        if (!queryString.isEmpty()) {
            queryString = queryString.substring(0, queryString.length() - 1);
        }

        String secureHash = hmacSHA512(secretKey, queryString);
        return baseUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public String getQueryParam(String url, String paramName) {
        try {
            URI uri = new URI(url);
            String query = uri.getQuery();
            String[] params = query.split("&");

            for (String param : params) {
                String[] pair = param.split("=", 2);
                String key = URLDecoder.decode(pair[0], StandardCharsets.UTF_8);
                if (key.equals(paramName)) {
                    String value = pair.length > 1 ? URLDecoder.decode(pair[1], StandardCharsets.UTF_8) : "";
                    return value;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean validateSignature(String inputHash, String secretKey) {
        String rawData = buildResponseRawData();
        String checksum = hmacSHA512(secretKey, rawData);
        return checksum.equalsIgnoreCase(inputHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac hmac = javax.crypto.Mac.getInstance("HmacSHA512");
            hmac.init(new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }

    private String buildResponseRawData() {
        responseData.remove("vnp_SecureHashType");
        responseData.remove("vnp_SecureHash");

        StringBuilder rawData = new StringBuilder();
        for (Map.Entry<String, String> entry : responseData.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                rawData.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                        .append("&");
            }
        }

        if (!rawData.isEmpty()) {
            rawData.setLength(rawData.length() - 1); // remove last &
        }

        return rawData.toString();
    }
}

