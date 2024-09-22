import React from "react";
import { FavoriteListItem } from "types/interface";
import defaultProfileImage from "assets/image/default-profile-image.png";
import "./style.css";

interface Props {
  favoriteListItem: FavoriteListItem;
}

//캄포넌트 : favorite List Item 컴포넌트
export default function FavoriteItem({ favoriteListItem }: Props) {
  const { profileImage, nickname } = favoriteListItem;
  //프로퍼티스

  //렌더 favorite List Item 렌더링 컴포넌트
  return (
    <div>
      <div className="favorite-list-item">
        <div className="favorite-list-item-profile-box">
          <div
            className="favorite-list-item-profile-image"
            style={{
              backgroundImage: `url(${
                profileImage ? profileImage : defaultProfileImage
              })`,
            }}
          >
          </div>
        </div>
      </div>
      <div className="favorite-list-item-nickname">{nickname}</div>
    </div>
  );
}
