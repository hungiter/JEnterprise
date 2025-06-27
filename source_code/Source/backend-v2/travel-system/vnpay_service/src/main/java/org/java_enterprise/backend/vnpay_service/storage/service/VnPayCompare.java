package org.java_enterprise.backend.vnpay_service.storage.service;

import java.text.Collator;
import java.util.Comparator;
import java.util.Locale;

public class VnPayCompare implements Comparator<String> {
    private final Collator collator = Collator.getInstance(Locale.US);

    @Override
    public int compare(String o1, String o2) {
        if (o1 == null) return -1;
        if (o2 == null) return 1;
        return collator.compare(o1, o2);
    }
}