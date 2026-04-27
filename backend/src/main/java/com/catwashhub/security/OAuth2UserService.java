package com.catwashhub.security;

import com.catwashhub.domain.User;
import com.catwashhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository m_UserRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest _userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(_userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String providerId = (String) attributes.get("sub");

        saveOrUpdateGoogleUser(email, name, providerId);

        return oAuth2User;
    }

    private void saveOrUpdateGoogleUser(String _email, String _name, String _providerId) {
        if (!m_UserRepository.existsByEmail(_email)) {
            User user = User.builder()
                    .email(_email)
                    .nickname(_name)
                    .provider(User.Provider.GOOGLE)
                    .providerId(_providerId)
                    .agreedTerms(true)
                    .agreedPrivacy(true)
                    .agreedMarketing(false)
                    .build();
            m_UserRepository.save(user);
        }
    }
}
