package com.catwashhub.util;

public class PlateUtil {

    // 번호판 마스킹: 한글 유지, 앞 숫자 마스킹, 뒤 digits자리 유지
    // 예) "12가 3456", digits=2 → "**가 **56"
    public static String mask(String plate, int digits) {
        if (plate == null || plate.isBlank()) { return null; }
        int safeDigits = Math.max(2, Math.min(4, digits));
        String[] parts = plate.trim().split(" ");
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            if (i > 0) { result.append(' '); }
            if (part.matches(".*[가-힣].*")) {
                result.append(part.replaceAll("[0-9]", "*"));
            } else if (i == parts.length - 1) {
                // 마지막 숫자 파트: digits만큼 공개
                if (part.length() <= safeDigits) {
                    result.append(part);
                } else {
                    result.append("*".repeat(part.length() - safeDigits));
                    result.append(part.substring(part.length() - safeDigits));
                }
            } else {
                result.append("*".repeat(part.length()));
            }
        }
        return result.toString();
    }

    // 하위 호환 (기본 2자리)
    public static String mask(String plate) {
        return mask(plate, 2);
    }

    private PlateUtil() {}
}
