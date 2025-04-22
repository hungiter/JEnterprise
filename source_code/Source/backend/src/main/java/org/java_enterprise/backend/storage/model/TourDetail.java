package org.java_enterprise.backend.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class TourDetail {
    private String imgMain;
    private List<String> imgThumbnails;
    private String sightseeingSpots;
    private String cuisine;
    private String suitableCustomers;
    private String idealTimes;
    private String vehicles;
    private List<String> tripPlan;
}
