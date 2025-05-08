package org.java_enterprise.backend.tour_service.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class ScheduleInfo {
    @Field("index")
    private Integer index;
    @Field("date_label")
    private String date_label;
    @Field("title")
    private String title;
    @Field("meal_info")
    private String meal_info;
    @Field("detail_html")
    private String detail_html;
}
