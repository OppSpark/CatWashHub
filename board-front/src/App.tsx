import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import BoardItem from "components/BoardItem";
import Top3Item from "components/Top3Item";
import CommentItem from "components/CommentItem";
import { commentListMock, latestBoardListMock, top3BoardListMock } from "mocks";
import favoriteListMock from "mocks/favorite-list.mock";
import FavoriteItem from "components/FavoriteItem";
import InputBox from "components/InputBox";
import Footer from "layouts/Footer";
import Main from "views/Main";
import Authentication from "views/Authentication";
import Search from "views/Search";
import User from "views/User";
import BoardDetail from "views/Borad/Detail";
import BoardWrite from "views/Borad/Write";
import BoardUpdate from "views/Borad/Update";
import Container from "layouts/Container";
import { AUTH_PATH, BOARD_DETAIL_PATH, BOARD_PATH, BOARD_UPDATE_PATH, BOARD_WRITE_PATH, MAIN_PATH, SEARCH_PATH, USER_PATH } from "components";

// 컴포넌트 ; Application 컴포넌트
function App() {
  //test 용도
  const [value, setValue] = useState<string>("");

  //렌더 : 어플리케이션 렌더러 컴포넌트
  /* 
    description : 메인화면 '/' 
    description : 로그인, 회원가입 화면 '/auth'
    description : 검색화면 '/search'
    description : 게시물 상세보기 '/board/detail'
    description : 게시물 작성하기 '/board/write'
    description : 게시물 수정하기 'board/update'
  */
  return (
    <>
      <Routes>
        <Route element={<Container />}>
          <Route path={MAIN_PATH()} element={<Main />} />
          <Route path={AUTH_PATH()} element={<Authentication />} />
          <Route path={SEARCH_PATH(':searchWord')} element={<Search />} />
          <Route path={USER_PATH(':userEmail')} element={<User />} />
          <Route path={BOARD_PATH()}>
            <Route path={BOARD_DETAIL_PATH(':boardNumber')} element={<BoardDetail />} />
            <Route path={BOARD_WRITE_PATH()} element={<BoardWrite />} />
            <Route path={BOARD_UPDATE_PATH(':boardNumber')} element={<BoardUpdate />} />
          </Route>
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Route>
      </Routes>

      {/* <div>
        {latestBoardListMock.map((boardListItem) => (
          <BoardItem boardListItem={boardListItem} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
        {top3BoardListMock.map((top3ListItem) => (
          <Top3Item top3ListItem={top3ListItem} />
        ))}
      </div>
      <div
        style={{
          padding: "0px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        {commentListMock.map((commentLisItem) => (
          <CommentItem commentListItem={commentLisItem} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          columnGap: "30px",
          rowGap: "20px",
        }}
      >
        {favoriteListMock.map((favoriteListItem) => (
          <FavoriteItem favoriteListItem={favoriteListItem} />
        ))}
      </div>

      <InputBox
        label="이메일"
        type="text"
        placeholder="이메일 주소를 입력해주세요"
        value={value}
        error={false}
        setValue={setValue}
        message="hello"
      />

      <Footer /> */}
    </>
  );
}

export default App;
