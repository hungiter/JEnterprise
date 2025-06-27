package org.java_enterprise.backend.tour_service.storage.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "tags")
@Getter
@Setter
@NoArgsConstructor // Constructor không tham số
public class Tag {
    @Id
    private String id;
    @Field("value")
    private String value;
}
