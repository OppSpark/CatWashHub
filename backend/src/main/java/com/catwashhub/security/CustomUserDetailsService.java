package com.catwashhub.security;

import com.catwashhub.domain.User;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository m_UserRepository;

    @Override
    public UserDetails loadUserByUsername(String _email) throws UsernameNotFoundException {
        User user = m_UserRepository.findByEmail(_email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword() != null ? user.getPassword() : "",
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
