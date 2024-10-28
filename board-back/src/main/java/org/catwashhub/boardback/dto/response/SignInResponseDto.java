package org.catwashhub.boardback.dto.response;

import lombok.Getter;
import org.catwashhub.boardback.common.ResponseCode;
import org.catwashhub.boardback.common.ResponseMessage;
import org.catwashhub.boardback.dto.request.auth.SignInRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Getter
public class SignInResponseDto extends ResponseDto {

    private String token;
    private int expirationTime;

    private SignInResponseDto(String token) {
        super(ResponseCode.SUCCESS, ResponseMessage.SUCCESS);
        this.token = token;
        this.expirationTime = 3600;
    }

    public static ResponseEntity<SignInResponseDto> success(String token) {
        SignInResponseDto result = new SignInResponseDto (token) ;
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }


    public static ResponseEntity<ResponseDto> signInFail() {
        ResponseDto result = new ResponseDto(ResponseCode.SIGN_IN_FAIL, ResponseMessage.SIGN_IN_FAIL);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
}