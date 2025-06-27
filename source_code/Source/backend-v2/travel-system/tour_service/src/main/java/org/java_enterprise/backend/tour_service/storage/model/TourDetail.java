package org.java_enterprise.backend.tour_service.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;


@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class TourDetail {
    @Field("img_main")
    private String img_main;
    @Field("img_thumbnails")
    private List<String> img_thumbnails;
    @Field("sightseeing_spots")
    private String sightseeing_spots;
    @Field("cuisine")
    private String cuisine;
    @Field("suitable_customers")
    private String suitable_customers;
    @Field("ideal_times")
    private String ideal_times;
    @Field("vehicles")
    private String vehicles;
    @Field("trip_plan")
    private List<ScheduleInfo> trip_plan;
}
