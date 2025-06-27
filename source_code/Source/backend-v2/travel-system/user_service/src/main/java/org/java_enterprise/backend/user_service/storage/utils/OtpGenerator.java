package org.java_enterprise.backend.user_service.storage.utils;

import java.security.SecureRandom;

public class OtpGenerator {

    private static final SecureRandom secureRandom = new SecureRandom(); // Bảo mật hơn Random thường
    private static final String DIGITS = "0123456789";

    public static String generateOtp(int length) {
        if (length <= 0) {
            throw new IllegalArgumentException("OTP length must be greater than zero");
        }

        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(DIGITS.charAt(secureRandom.nextInt(DIGITS.length())));
        }
        return otp.toString();
    }
}