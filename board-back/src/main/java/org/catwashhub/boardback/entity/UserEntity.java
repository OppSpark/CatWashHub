package org.catwashhub.boardback.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity(name="user")
@Table(name="user")
public class UserEntity {

    @Id
    private String email;
    private String nickname;
    private String telNumber;
    private String address;
    private String addressDetail;
    private String profileImage;

}
