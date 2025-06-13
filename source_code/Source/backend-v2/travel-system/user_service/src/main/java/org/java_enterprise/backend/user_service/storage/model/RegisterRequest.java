package org.java_enterprise.backend.user_service.storage.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    @NotBlank(message = "Tên tài khoản không được để trống")
    private String username;
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 32, message = "Mật khẩu cần có độ dài từ 8-32 kí tự")
    @Pattern(regexp = "^[a-z0-9]+$", message = "Mật khẩu chỉ được chứa chữ thường và số (a-z, 0-9)")
    private String password;
    private String role;
}