package org.catwashhub.boardback.service;

import org.catwashhub.boardback.dto.request.auth.SignInRequestDto;
import org.catwashhub.boardback.dto.request.auth.SignUpRequestDto;

import org.catwashhub.boardback.dto.response.SignInResponseDto;
import org.catwashhub.boardback.dto.response.auth.SignUpResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;

public interface AuthService {
    ResponseEntity<? super SignUpResponseDto> signUp(SignUpRequestDto dto);

    ResponseEntity<? super SignInResponseDto> signIn(SignInRequestDto dto);
}