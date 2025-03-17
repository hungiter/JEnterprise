package org.java_enterprise.backend.storage.model;

public enum UserRole {
    NORMAL("NORMAL"),
    ADMIN("ADMIN"), // Example of another role
    MODERATOR("MODERATOR"); // You can add more roles if needed

    private final String roleName;

    UserRole(String roleName) {
        this.roleName = roleName;
    }

    public String getRoleName() {
        return roleName;
    }
}
