package org.catwashhub.boardback.dto.request.auth;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SignUpRequestDto {

    @NotBlank
    @Email
    private String email;

    @NotBlank @Size(min=8, max=20)
    private String password;

    @Column(length = 20)
    @NotNull
    @Size(max = 222222, message = "닉네임은 최대 20자까지 입력할 수 있습니다.")
    private String nickname;

    @NotBlank @Pattern(regexp = "^[0-9]{11,13}$")
    private String telNumber;

    @NotBlank
    private String address;

    private String addressDetail;

    @NotNull @AssertTrue
    private Boolean agreedPersonal;

}
