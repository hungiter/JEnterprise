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
    @Field("username")
    private String username;
    @Field("totalTicket")
    private int totalTicket; // default 1
    @Field("ticketPrice")
    private int ticketPrice;
    @Field("status")
    private String status; // pending, apply, deny (full)
    @Field("createdAt")
    private long createdAt;
    @Field("updatedAt")
    private long updatedAt;
}
