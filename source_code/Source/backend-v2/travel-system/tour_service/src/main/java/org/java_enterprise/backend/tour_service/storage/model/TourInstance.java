package org.java_enterprise.backend.tour_service.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Document(collection = "tour_instances")
@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class TourInstance {
    @Id
    private String id;

    @Field("instanceId")
    private String instanceId;
    @Field("tourId")
    private String tourId;
    @Field("startDate")
    private String startDate;
    @Field("totalSlot")
    private Integer totalSlot= 36;
    @Field("remainingSlot")
    private Integer remainingSlot= 36;
    @Field("status")
    private String status= "PENDING";
    @Field("guiderIds")
    private List<String> guiderIds = Collections.emptyList();
}
