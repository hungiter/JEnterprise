package org.java_enterprise.backend.tour_service.storage.utils;

import java.time.Instant;

public class TimeUtils {
    public long getCurrentTimeMilli() {
        return Instant.now().toEpochMilli();
    }
}