package com.catwashhub.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    // ==================== 상수 ====================
    private static final String c_DefaultRole = "USER";

    // ==================== 필드 ====================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Provider provider;

    private String providerId;

    @Column(nullable = false)
    private Boolean agreedTerms;

    @Column(nullable = false)
    private Boolean agreedPrivacy;

    private Boolean agreedMarketing;

    @Column(nullable = false)
    private Boolean isDeleted;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    // ==================== 생성자 ====================
    @Builder
    public User(String email, String password, String nickname, Role role,
                Provider provider, String providerId,
                Boolean agreedTerms, Boolean agreedPrivacy, Boolean agreedMarketing) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = (role != null) ? role : Role.USER;
        this.provider = (provider != null) ? provider : Provider.LOCAL;
        this.providerId = providerId;
        this.agreedTerms = agreedTerms;
        this.agreedPrivacy = agreedPrivacy;
        this.agreedMarketing = (agreedMarketing != null) ? agreedMarketing : false;
        this.isDeleted = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ==================== 기능별 함수 ====================
    public void updateNickname(String _nickname) {
        this.nickname = _nickname;
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePassword(String _encodedPassword) {
        this.password = _encodedPassword;
        this.updatedAt = LocalDateTime.now();
    }

    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return Boolean.TRUE.equals(this.isDeleted);
    }

    // ==================== Enum ====================
    public enum Role {
        USER, ADMIN
    }

    public enum Provider {
        LOCAL, GOOGLE
    }
}
