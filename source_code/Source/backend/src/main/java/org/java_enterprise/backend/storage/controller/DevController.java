package org.java_enterprise.backend.storage.controller;

import lombok.RequiredArgsConstructor;
import org.java_enterprise.backend.storage.service.CalendarFixService;
import org.java_enterprise.backend.storage.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
public class DevController {

    @Autowired
    private CalendarFixService calendarFixService;

    @GetMapping("/fix-calendar")
    public ResponseEntity<String> fixCalendar() {
        calendarFixService.fixCalendars();
        return ResponseEntity.ok("Calendar updated!");
    }
}
