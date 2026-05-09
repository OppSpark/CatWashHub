package com.catwashhub.service;

import com.catwashhub.domain.User;
import com.catwashhub.dto.request.SignupRequest;
import com.catwashhub.dto.request.UpdateNicknameRequest;
import com.catwashhub.dto.request.UpdatePasswordRequest;
import com.catwashhub.dto.response.AuthResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.UserRepository;
import com.catwashhub.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository m_UserRepository;
    private final PasswordEncoder m_PasswordEncoder;
    private final JwtUtil m_JwtUtil;

    // ==================== 기능별 함수 ====================
    @Transactional
    public void signup(SignupRequest _request) {
        if (!Boolean.TRUE.equals(_request.agreedTerms()) || !Boolean.TRUE.equals(_request.agreedPrivacy())) {
            throw new CustomException(ErrorCode.TERMS_NOT_AGREED);
        }
        if (m_UserRepository.existsByEmail(_request.email())) {
            throw new CustomException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (m_UserRepository.existsByNickname(_request.nickname())) {
            throw new CustomException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(_request.email())
                .password(m_PasswordEncoder.encode(_request.password()))
                .nickname(_request.nickname())
                .provider(User.Provider.LOCAL)
                .agreedTerms(_request.agreedTerms())
                .agreedPrivacy(_request.agreedPrivacy())
                .agreedMarketing(_request.agreedMarketing())
                .build();

        m_UserRepository.save(user);
    }

    @Transactional
    public AuthResponse updateNickname(String _email, UpdateNicknameRequest _request) {
        User user = getUser(_email);
        if (m_UserRepository.existsByNicknameAndEmailNot(_request.nickname(), _email)) {
            throw new CustomException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }
        user.updateNickname(_request.nickname());
        return new AuthResponse(
                m_JwtUtil.generateAccessToken(user.getEmail()),
                m_JwtUtil.generateRefreshToken(user.getEmail()),
                user.getNickname(),
                user.getEmail()
        );
    }

    @Transactional
    public void updatePassword(String _email, UpdatePasswordRequest _request) {
        User user = getUser(_email);
        if (!m_PasswordEncoder.matches(_request.currentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
        user.updatePassword(m_PasswordEncoder.encode(_request.newPassword()));
    }

    @Transactional
    public void deleteAccount(String _email) {
        User user = getUser(_email);
        user.softDelete();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String _email, String _password) {
        User user = m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.isDeleted()) {
            throw new CustomException(ErrorCode.DELETED_USER);
        }
        if (!m_PasswordEncoder.matches(_password, user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        return new AuthResponse(
                m_JwtUtil.generateAccessToken(user.getEmail()),
                m_JwtUtil.generateRefreshToken(user.getEmail()),
                user.getNickname(),
                user.getEmail()
        );
    }

    // ==================== 초기화 함수 ====================
    private User getUser(String _email) {
        return m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
