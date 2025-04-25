package org.java_enterprise.backend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TourSummaryDTO {
    private String tour_code;
    private String thumbnail;
    private String title;
    private String departure;
    private String duration;
    private String vehicle;
    private String price;
    private int price_value;
    private String tag;
    private List<String> calendar;
}

