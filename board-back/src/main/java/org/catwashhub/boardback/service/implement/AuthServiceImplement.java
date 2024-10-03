package org.catwashhub.boardback.service.implement;


import lombok.RequiredArgsConstructor;
import org.catwashhub.boardback.dto.request.auth.SignUpRequestDto;
import org.catwashhub.boardback.dto.response.auth.SignUpResponseDto;
import org.catwashhub.boardback.entity.UserEntity;
import org.catwashhub.boardback.repository.UserRepository;
import org.catwashhub.boardback.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImplement implements AuthService {

    private final UserRepository userRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public ResponseEntity<? super SignUpResponseDto> signUp(SignUpRequestDto dto) {

        try{
            String email = dto.getEmail();
            boolean existedEmail = userRepository.existsByEmail(email);
            if(existedEmail)
                return SignUpResponseDto.duplicateEmail();

            String nickname = dto.getNickname();
            boolean existedNickname = userRepository.existsByNickname(nickname);
            if(existedNickname)
                return SignUpResponseDto.duplicateNickname();

            String telNumber = dto.getTelNumber();
            boolean existedTelNumber = userRepository.existsByTelNumber(telNumber);
            if(existedTelNumber)
                return SignUpResponseDto.duplicateTelNumber();

            String password = dto.getPassword();
            String encodedPassword = passwordEncoder.encode(password);
            dto.setPassword(encodedPassword);

            UserEntity userEntity = new UserEntity(dto);
            userRepository.save(userEntity);

        }catch (Exception exception){
            exception.printStackTrace();
            return SignUpResponseDto.databaseError();
        }

        return SignUpResponseDto.success();
    }
}
