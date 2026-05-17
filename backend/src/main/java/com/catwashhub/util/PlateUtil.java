package com.catwashhub.util;

public class PlateUtil {

    // 번호판 마스킹: 한글 유지, 앞 숫자 마스킹, 뒤 2자리 유지
    // 예) "12가 3456" → "**가 **56"
    public static String mask(String plate) {
        if (plate == null || plate.isBlank()) { return null; }
        String[] parts = plate.trim().split(" ");
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            if (i > 0) { result.append(' '); }
            if (part.matches(".*[가-힣].*")) {
                result.append(part.replaceAll("[0-9]", "*"));
            } else {
                if (part.length() <= 2) {
                    result.append(part);
                } else {
                    result.append("*".repeat(part.length() - 2));
                    result.append(part.substring(part.length() - 2));
                }
            }
        }
        return result.toString();
    }

    private PlateUtil() {}
}
