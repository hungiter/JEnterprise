package org.java_enterprise.backend.tour_service.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "tour_engagements")
@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class TourEngagement {
    @Id
    private String id;

    @Field("tourId")
    private String tourId;
    @Field("username")
    private String username;
    @Field("sessionId")
    private String sessionId; // optional for guest
    @Field("status")
    private Integer status = 0; // -1: Dislike, 0: View, 1: Like
    @Field("lastAccess")
    private long lastAccess;
}

