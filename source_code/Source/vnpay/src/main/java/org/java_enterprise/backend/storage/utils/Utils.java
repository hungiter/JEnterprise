package org.java_enterprise.backend.storage.utils;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;

public class Utils {
    public static MultiValueMap<String, String> convertToMultiValueMap(Map<String, String[]> parameterMap) {
        MultiValueMap<String, String> multiValueMap = new LinkedMultiValueMap<>();

        for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
            String key = entry.getKey();
            String[] values = entry.getValue();

            if (values != null) {
                for (String value : values) {
                    multiValueMap.add(key, value);
                }
            }
        }

        return multiValueMap;
    }

}
