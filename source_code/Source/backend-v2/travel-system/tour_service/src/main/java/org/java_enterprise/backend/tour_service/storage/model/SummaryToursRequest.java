package org.java_enterprise.backend.tour_service.storage.model;

import java.util.List;

public class SummaryToursRequest {
    private List<String> tour_codes;

    public List<String> getTour_codes() {
        return tour_codes;
    }

    public void setTour_codes(List<String> tour_codes) {
        this.tour_codes = tour_codes;
    }
}
