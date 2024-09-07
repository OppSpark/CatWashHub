import React from "react";
import "./style.css";
import { BoardListItem } from "types/interface";
import { useNavigate } from "react-router-dom";
import DefaultProfileImage from "assets/image/default-profile-image.png";

interface Props {
  boardListItem: BoardListItem;
}

// 컴포넌트 : Board List Item 컴포넌트
export default function BoardItem({ boardListItem }: Props) {
  const { boardNumber, title, content, boardTitleImage } = boardListItem;
  const { favoriteCount, commentCount, viewCount } = boardListItem;
  const { writeDatetime, writerNickname, writerProfileImage } = boardListItem;

  //함수 : 네비게이터
  //const navigator = useNavigate();

  //이벤트 헨들러 : 게시물 아이템 클릭 이벤트 처리
  const onClickHandler = () => {
    //navigator(boardNumber);
  };

  // 렌더러 Board List Item 컴포넌트 렌더링
  return (
    <div className="board-list-item" onClick={onClickHandler}>
      <div className="board-list-item-main-box">
        <div className="board-list-item-top">
          <div className="board-list-item-profile-box">
            <div
              className="board-list-item-profile-image"
              style={{
                backgroundImage: `url(${
                  writerProfileImage || DefaultProfileImage
                })`,
              }}
            ></div>
          </div>
          <div className="board-list-item-write-box">
            <div className="board-list-item-nickname">{writerNickname}</div>
            <div className="board-list-item-write-datetime">
              {writeDatetime}
            </div>
          </div>
        </div>

        <div className="board-list-item-middle">
          <div className="board-list-item-title">{title}</div>
          <div className="board-list-item-content">{content}</div>
        </div>

        <div className="board-list-item-bottom">
          <div className="board-list-item-counts">{`댓글 ${commentCount} - 좋아요 ${favoriteCount} - 조회수 ${viewCount}`}</div>
        </div>
      </div>

      {/* 프로필 이미지가 null 이면 표시 X */}
      {boardTitleImage && (
        <div className="board-list-item-image-box">
          <div
            className="board-list-item-image"
            style={{ backgroundImage: `url(${boardTitleImage})` }}
          ></div>
        </div>
      )}
    </div>
  );
}
