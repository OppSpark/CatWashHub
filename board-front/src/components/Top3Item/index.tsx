import React from "react";
import "./style.css";
import DefaultProfileImage from "assets/image/default-profile-image.png";
import { BoardListItem } from "types/interface";
import { useNavigate } from "react-router-dom";

interface Props {
  top3ListItem: BoardListItem;
}

// 컴포넌트 :  Top3 List Item 컴포넌트
export default function Top3Item({ top3ListItem }: Props) {
  const { boardNumber, title, content, boardTitleImage } = top3ListItem;
  const { favoriteCount, commentCount, viewCount } = top3ListItem;
  const { writeDatetime, writerNickname, writerProfileImage } = top3ListItem;
  //프로퍼티스
  //함수 : 네비게이터
  //const navigator = useNavigate();

  //이벤트 헨들러 : 게시물 아이템 클릭 이벤트 처리
  const onClickHandler = () => {
    //navigator(boardNumber);
  };

  // 렌더 : Top 3 List Item 컴포넌트 렌던링
  return (
    <div
      className="top-3-list-item"
      style={{ backgroundImage: `url(${boardTitleImage})` }}
      onClick={onClickHandler}
    >
      <div className="top-3-list-item-main-box">
        <div className="top-3-list-item-top">
          <div className="top-3-list-item-profile-box">
            <div
              className="top-3-list-item-profile-image"
              style={{
                backgroundImage: `url(${
                  writerProfileImage || DefaultProfileImage
                })`,
              }}
            ></div>
          </div>
          <div className="top-3-list-item-write-box"></div>
          <div className="top-3-list-item-nickname">{writerNickname}</div>
          <div className="top-3-list-item-write-date">{writeDatetime}</div>
        </div>
        <div className="top-3-list-item-middle">
          <div className="top-3-list-item-title">{title}</div>
          <div className="top-3-list-item-write-content">{content}</div>
        </div>
        <div className="top-3-list-item-bottom">
          <div className="top-3-list-item-write-box">
            <div className="top-3-list-item-write-counts">{`댓글 ${commentCount} - 좋아요 ${favoriteCount} - 조회수 ${viewCount}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
