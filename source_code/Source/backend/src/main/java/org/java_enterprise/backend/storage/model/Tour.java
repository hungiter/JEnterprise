package org.java_enterprise.backend.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "tours")
@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class Tour {
    @Id
    private String tourCode;

    private String thumbnail;
    private String title;
    private String departure;
    private String duration;
    private String vehicle;
    private List<String> calendar;
    private String price;
    private int priceValue;
    private String detailUrl;
    private String tag;
    private TourDetail tourDetail;

    // Getters và setters...
}
