package org.java_enterprise.backend.storage.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ErrorViewDTO {
    private String requestId;

    public boolean isShowRequestId() {
        return requestId != null && !requestId.isEmpty();
    }
}