package com.catwashhub.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 인증
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    NICKNAME_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    TERMS_NOT_AGREED(HttpStatus.BAD_REQUEST, "필수 약관에 동의해주세요."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다."),
    DELETED_USER(HttpStatus.FORBIDDEN, "탈퇴한 계정입니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),

    // 제품/카테고리
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 제품입니다."),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 카테고리입니다."),
    CATEGORY_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 존재하는 카테고리입니다."),

    // 세차 일지
    WASH_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 세차 기록입니다."),
    WASH_SESSION_FORBIDDEN(HttpStatus.FORBIDDEN, "해당 세차 기록에 접근 권한이 없습니다."),

    // 용품 세트
    PRODUCT_SET_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 용품 세트입니다."),
    PRODUCT_SET_FORBIDDEN(HttpStatus.FORBIDDEN, "해당 용품 세트에 접근 권한이 없습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
