package com.catwashhub.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @Email(message = "이메일 형식이 올바르지 않습니다.")
        @NotBlank(message = "이메일을 입력해주세요.")
        String email,

        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
        String password,

        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(min = 2, max = 50, message = "닉네임은 2자 이상 50자 이하이어야 합니다.")
        String nickname,

        @NotNull(message = "이용약관 동의 여부를 선택해주세요.")
        Boolean agreedTerms,

        @NotNull(message = "개인정보처리방침 동의 여부를 선택해주세요.")
        Boolean agreedPrivacy,

        Boolean agreedMarketing
) {}
