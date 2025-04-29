package org.java_enterprise.backend.user_service.storage.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users") // Collection trong MongoDB
@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private String role;

    public User(String username, String email, String role) {
        this.username = username;
        this.email = email;
        this.role = role;
    }
}