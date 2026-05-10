package com.catwashhub.config;

import com.catwashhub.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter m_JwtAuthenticationFilter;

    // OAuth2 관련 (나중에 활성화)
    // private final CustomOAuth2UserService m_OAuth2UserService;
    // private final OAuth2SuccessHandler m_OAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity _http) throws Exception {
        _http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/prometheus").permitAll()
                        // 비로그인 공개 허용 — 게시글 조회, 계산기, 제품/카테고리 조회, 레시피 조회
                        .requestMatchers("GET", "/api/posts", "/api/posts/{id}").permitAll()
                        .requestMatchers("GET", "/api/posts/{id}/comments").permitAll()
                        .requestMatchers("GET", "/api/products", "/api/products/{id}").permitAll()
                        .requestMatchers("GET", "/api/categories").permitAll()
                        .requestMatchers("GET", "/api/recipes", "/api/recipes/{id}", "/api/recipes/top").permitAll()
                        // .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .anyRequest().authenticated()
                )
                // OAuth2 로그인 (나중에 활성화)
                // .oauth2Login(oauth2 -> oauth2
                //         .userInfoEndpoint(userInfo -> userInfo.userService(m_OAuth2UserService))
                //         .successHandler(m_OAuth2SuccessHandler)
                // )
                .addFilterBefore(m_JwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return _http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://catwashhub.oppspark.net",
                "https://dev.catwashhub.oppspark.net"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
