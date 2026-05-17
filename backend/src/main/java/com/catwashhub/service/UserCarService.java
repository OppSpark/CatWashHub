package com.catwashhub.service;

import com.catwashhub.domain.User;
import com.catwashhub.domain.UserCar;
import com.catwashhub.dto.request.UserCarRequest;
import com.catwashhub.dto.response.UserCarResponse;
import com.catwashhub.exception.CustomException;
import com.catwashhub.exception.ErrorCode;
import com.catwashhub.repository.UserCarRepository;
import com.catwashhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserCarService {

    private final UserCarRepository m_UserCarRepository;
    private final UserRepository m_UserRepository;

    @Transactional(readOnly = true)
    public Optional<UserCarResponse> getMyCar(String _email) {
        try {
            User user = m_UserRepository.findByEmail(_email)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            return m_UserCarRepository.findByUserId(user.getId())
                    .map(UserCarResponse::from);
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public UserCarResponse saveMyCar(String _email, UserCarRequest _req) {
        try {
            User user = m_UserRepository.findByEmail(_email)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

            UserCar car = m_UserCarRepository.findByUserId(user.getId())
                    .orElse(null);

            if (car == null) {
                car = UserCar.builder()
                        .user(user)
                        .carModel(_req.carModel())
                        .carColor(_req.carColor())
                        .plateNumber(_req.plateNumber())
                        .build();
            } else {
                car.update(_req.carModel(), _req.carColor(), _req.plateNumber());
            }

            return UserCarResponse.from(m_UserCarRepository.save(car));
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
