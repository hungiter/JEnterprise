package org.java_enterprise.backend.user_service.storage.service;

import org.java_enterprise.backend.user_service.storage.model.User;
import org.java_enterprise.backend.user_service.storage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // CRUD =========================================================
    // Create - C
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // Read - R
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    // Update - U
    public Optional<User> updateUser(String id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setRole(userDetails.getRole());
            user.setPassword(userDetails.getPassword());
            return userRepository.save(user);
        });
    }

    // Delete - D
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    // OTHERS METHODS ===============================================
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}

