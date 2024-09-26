package org.catwashhub.boardback.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.catwashhub.boardback.common.ResponseCode;
import org.catwashhub.boardback.common.ResponseMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseBody;

@Getter
@AllArgsConstructor
public class ResponseDto {

    private String code;
    private String message;

    public static ResponseEntity<ResponseDto> databaseError(){
        ResponseDto responseBody = new ResponseDto(ResponseCode.DATABASE_ERROR, ResponseMessage.DATABASE_ERROR);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
    }
}
