package org.java_enterprise.backend.user_service.storage.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpValidateRequest {
    @NotBlank(message = "Vui lòng nhập mã OTP")
    @Size(min = 6, max = 6, message = "OTP có độ dài là 6 kí tự")
    private String otp;
    @NotBlank(message = "Bạn cheat đúng hem, sao không thấy tên tài khoản dọ!!!")
    private String username;
}
