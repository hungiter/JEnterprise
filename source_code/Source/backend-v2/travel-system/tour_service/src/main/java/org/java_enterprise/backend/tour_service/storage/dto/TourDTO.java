package org.java_enterprise.backend.tour_service.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.java_enterprise.backend.tour_service.storage.model.TourDetail;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Data
@AllArgsConstructor
public class TourDTO {
    private String tourCode;
    private String thumbnail;
    private String title;
    private String departure;
    private String duration;
    private String vehicle;
    private List<String> calendar;
    private String price;
    private int priceValue;
    private String tag;
    private String detailUrl;
    private TourDetail tourDetail;
}
