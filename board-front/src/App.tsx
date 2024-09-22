import React from "react";
import "./App.css";
import BoardItem from "components/BoardItem";
import Top3Item from "components/Top3Item";
import CommentItem from "components/CommentItem";
import { commentListMock, latestBoardListMock, top3BoardListMock } from "mocks";
import favoriteListMock from "mocks/favorite-list.mock";
import FavoriteItem from "components/FavoriteItem";

function App() {
  return (
    <>
      <div>
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
    </>
  );
}

export default App;
