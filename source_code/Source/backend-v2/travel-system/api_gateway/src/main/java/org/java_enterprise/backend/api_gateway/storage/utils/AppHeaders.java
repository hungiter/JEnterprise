package org.java_enterprise.backend.api_gateway.storage.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class AppHeaders {
    @Value("${app.secret}")
    private String secretKey;

    public HttpHeaders getHeaders(){
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", secretKey); // thêm header bí mật
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
