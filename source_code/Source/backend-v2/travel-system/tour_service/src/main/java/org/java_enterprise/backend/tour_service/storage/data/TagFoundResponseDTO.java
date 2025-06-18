package org.java_enterprise.backend.tour_service.storage.data;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class TagFoundResponseDTO {
    private boolean success;
    private String message;
    private List<String> tags;

    static public TagFoundResponseDTO creatErrorResponse(String message) {
        return TagFoundResponseDTO.builder().success(false).message(message).tags(Collections.emptyList()).build();
    }

    static public TagFoundResponseDTO createSuccessResponse(List<String> tags) {
        return TagFoundResponseDTO.builder().success(true).message("Tìm thấy từ khoá phù hợp").tags(tags).build();
    }
}
