package org.java_enterprise.backend.tour_service.storage.data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SummaryToursRequestDTO {
    private List<String> tour_codes;
}
