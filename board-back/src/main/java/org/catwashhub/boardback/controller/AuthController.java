package org.catwashhub.boardback.controller;

import jakarta.persistence.Id;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.catwashhub.boardback.dto.request.auth.SignUpRequestDto;
import org.catwashhub.boardback.dto.response.auth.SignUpResponseDto;
import org.catwashhub.boardback.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sign-up")
    public ResponseEntity<? super SignUpResponseDto> signUp(
            @RequestBody
            @Valid
            SignUpRequestDto requestBody
    ){
        ResponseEntity<? super  SignUpResponseDto> response = authService.signUp(requestBody);
        return response;
    }
}
