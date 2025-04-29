package org.java_enterprise.backend.user_service.storage.service;

import lombok.RequiredArgsConstructor;
import org.java_enterprise.backend.user_service.storage.model.*;
import org.java_enterprise.backend.user_service.storage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    @Autowired
    private final UserService userService;
    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final OtpService otpService;

    private final PasswordEncoder passwordEncoder;

    // Tạo token sau khi đăng ký
    public AuthResponse register(RegisterRequest request) {
        AuthError authError = new AuthError();
        if (userService.getUserByEmail(request.getEmail()).isPresent()) {
            authError.setEmail("Email này đã gắn với tài khoản khác");
        }

        if (userService.getUserByUsername(request.getUsername()).isPresent()) {
            authError.setUsername("Tên tài khoản đã có người sử dụng");
        }

        Boolean emailError = authError.getEmail() != null && !authError.getEmail().isBlank();
        Boolean usernameError = authError.getUsername() != null && !authError.getUsername().isBlank();
        if (emailError || usernameError) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Vui lòng kiểm tra lại thông tin tài khoản")
                    .data(null)
                    .error(authError)
                    .build();
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("User");
        userService.createUser(user);

        String jwtToken = jwtService.generateToken(request.getUsername());

        AuthData authData = AuthData.builder().token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole()) // giả sử user có field role
                .build();

        return AuthResponse.builder()
                .success(true)
                .message("Đăng kí tài khoản thành công")
                .data(authData) // giả sử user có field role
                .build();
    }

    // Kiểm tra username và password sau khi login
    public AuthResponse authenticate(String username, String password) {
        Optional<User> userOpt = userService.getUserByUsername(username);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            String errorMessage = "Sai thông tin tài khoản!";
            AuthError authError = AuthError.builder()
                    .server(errorMessage)
                    .build();

            return AuthResponse.builder()
                    .success(false)
                    .message(errorMessage)
                    .data(null)
                    .error(authError)
                    .build();
        }


        User user = userOpt.get();
        String jwtToken = jwtService.generateToken(username);

        AuthData authData = AuthData.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole()) // giả sử User có field 'role'
                .build();

        return AuthResponse.builder()
                .success(true)
                .message("Đăng nhập thành công")
                .data(authData)
                .build();
    }
}
