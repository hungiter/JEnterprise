package org.java_enterprise.backend.user_service.storage.service;

import lombok.RequiredArgsConstructor;
import org.java_enterprise.backend.user_service.storage.utils.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {
    @Autowired
    private final EmailService emailService;

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public String generateOtp(String username) {
        String otp = OtpGenerator.generateOtp(6); // OTP 6 số

        otpStorage.put(username, otp);

        emailService.sendOtpEmail(username, otp);

        return otp;
    }

    public boolean validateOtp(String username, String otp) {
        String storedOtp = otpStorage.get(username);
        return storedOtp != null && storedOtp.equals(otp);
    }
}