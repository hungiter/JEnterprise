package org.java_enterprise.backend.tour_service.storage.service;

import org.java_enterprise.backend.tour_service.storage.model.Tour;
import org.java_enterprise.backend.tour_service.storage.repository.TourRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CalendarFixService {

    private final TourRepository tourRepository;

    public CalendarFixService(TourRepository tourRepository) {
        this.tourRepository = tourRepository;
    }

    public void fixCalendars() {
        List<Tour> tours = tourRepository.findAll();
        DateTimeFormatter inputFormat = DateTimeFormatter.ofPattern("dd/MM");  // Fix input format
        DateTimeFormatter outputFormat = DateTimeFormatter.ISO_LOCAL_DATE;  // yyyy-MM-dd

        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();

        for (Tour tour : tours) {
            var ref = new Object() {
                boolean hasChanged = false;
            };
            List<String> newCalendar = tour.getCalendar().stream().map(dateStr -> {
                try {
                    // Fix the pattern to parse month and day correctly
                    MonthDay monthDay = MonthDay.parse(dateStr, inputFormat);

                    // Set the current year to the parsed month and day
                    LocalDate fullDate = monthDay.atYear(currentYear);

                    // If the fullDate has already passed this year, set it to the next year
                    if (fullDate.isBefore(today)) {
                        fullDate = fullDate.plusYears(1);
                    }

                    if (!ref.hasChanged) {
                        ref.hasChanged = true;
                    }

                    // Return the formatted date as yyyy-MM-dd
                    return fullDate.format(outputFormat);  // yyyy-MM-dd
                } catch (Exception e) {
                    // If there is any exception, return the original string
                    return dateStr;
                }
            }).toList();

            // Set the updated calendar for the tour
            if (ref.hasChanged) {
                System.out.println("Pre-processed: " + tour.getCalendar());
                System.out.println("Processed: " + newCalendar);
                tour.setCalendar(newCalendar);
                tourRepository.save(tour);
            } else {
                System.out.println("Calendar of " + tour.getTourCode() + " haven't changed.");
            }
        }

        System.out.println("✅ Đã cập nhật calendar cho " + tours.size() + " tour.");
    }
}

