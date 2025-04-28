package org.java_enterprise.backend.tour_service.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "tours")
@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class Tour {
    @Id
    private String id;

    @Field("tour_code")
    private String tourCode;
    @Field("thumbnail")
    private String thumbnail;
    @Field("title")
    private String title;
    @Field("departure")
    private String departure;
    @Field("duration")
    private String duration;
    @Field("vehicle")
    private String vehicle;
    @Field("calendar")
    private List<String> calendar;
    @Field("price")
    private String price;
    @Field("priceValue")
    private int priceValue;
    @Field("tag")
    private String tag;
    @Field("detail_url")
    private String detailUrl;
    @Field("tour_detail")
    private TourDetail tourDetail;
    // Getters và setters...
}
