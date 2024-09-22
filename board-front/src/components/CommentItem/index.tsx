import React from "react";
import "./style.css";
import { CommentListItem } from "types/interface";
import defaultProfileImage from "assets/image/default-profile-image.png";
import commentListMock from "mocks/comment-list-mock";

interface Props {
  commentListItem: CommentListItem;
}

//컴포넌트 : Comment List Item 컴포넌트
export default function CommentItem({ commentListItem }: Props) {
  const { nickname, profileImage, writeDatetime, content } = commentListItem;
  //프로퍼티스

  //렌더 : Comment List Item 랜더링 컴포턴트
  return (
    <div className="comment-list-item-">
      <div className="comment-list-item-top">
        <div className="comment-list-item-profile-box">
          <div
            className="comment-list-item-profile-image"
            style={{
              backgroundImage: `url(${
                profileImage ? profileImage : defaultProfileImage
              })`,
            }}
          ></div>
        </div>
        <div className="comment-list-item-nickname">{nickname}</div>
        <div className="comment-list-item-divider">{"|"}</div>
        <div className="comment-list-item-time">{writeDatetime}</div>
      </div>
      <div className="comment-list-item-main">
        <div className="comment-list-item-content">{content}</div>
      </div>
    </div>
  );
}
