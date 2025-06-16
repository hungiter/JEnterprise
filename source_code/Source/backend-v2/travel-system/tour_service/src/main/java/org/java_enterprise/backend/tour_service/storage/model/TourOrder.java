package org.java_enterprise.backend.tour_service.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "tour_orders")
@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class TourOrder {
    @Id
    private String id;
    @Field("instanceId")
    private String instanceId;
    @Field("userId")
    private String userId;
    @Field("totalTicket")
    private Integer totalTicket; // default 1
    @Field("status")
    private String status; // pending, apply, deny (full)
    @Field("createdAt")
    private long createAt;
    @Field("validateAt")
    private long validateAt;

}
