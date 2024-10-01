import { ChangeEvent, useRef, useState, KeyboardEvent, useEffect } from "react";
import "./style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AUTH_PATH,
  BOARD_DETAIL_PATH,
  BOARD_UPDATE_PATH,
  BOARD_WRITE_PATH,
  MAIN_PATH,
  SEARCH_PATH,
  USER_PATH,
} from "constants/";
import { useCookies } from "react-cookie";
import { useBoardStore, useLoginUserStore } from "stores";
import BoardDetail from "views/Board/Detail";
import path from "path";
import { BOARD_PATH } from "constants/";

//컴포넌트 : Header Layout
export default function Header() {
  // 상태 : 로그인 유저 상태
  const { loginUser, setLoginUser, resetLoginUser } = useLoginUserStore();

  // 상태 : cookie 상태
  const [cookies, setCookie] = useCookies();

  // 상태 : path 상태
  const { pathname } = useLocation();

  // 상태 : 로그인 상태
  const [isLogin, setLogin] = useState<boolean>(false);

  // 상태 : 인증 페이지 상태
  const [isAuthPage, setAuthPage] = useState<boolean>(false);
  // 상태 : 메인 페이지 상태
  const [isMainPage, setMainPage] = useState<boolean>(false);
  // 상태 : 검색 페이지 상태
  const [isSearchPage, setSearchPage] = useState<boolean>(false);
  // 상태 : 게시물 상세 페이지 상태
  const [isBoardDetailPage, setBoardDetailPage] = useState<boolean>(false);
  // 상태 : 게시물 작성 페이지 상태
  const [isBoardWritePage, setBoardWritePage] = useState<boolean>(false);
  // 상태 : 게시물 수정 페이지 상태
  const [isBoardUpdatePage, setBoardUpdatePage] = useState<boolean>(false);
  // 상태 : 유저 페이지 상태
  const [isUserPage, setUserPage] = useState<boolean>(false);

  //함수 : 네비게이트 함수
  const navigate = useNavigate();

  // 이벤트 헨들러 : 로고 클릭 이벤트 처리 함수
  const onLogoClickHandler = () => {
    navigate(MAIN_PATH());
  };

  // 컴포넌트 : 검색 버튼 컴포넌트
  const SearchButton = () => {
    //스테이트 : 검색어 입력 요소 참조 상태
    const searchButtonRef = useRef<HTMLDivElement | null>(null);

    // 스테이트 : 검색 버튼 상태
    const [status, setStatus] = useState<boolean>(false);

    // 스테이트 : 검색어 상태
    const [word, setWord] = useState<string>("");

    //스테이트 : 검색어 path variable 상태
    const { searchWord } = useParams();

    //이벤트 헨들러 : 검색어 변경 이벤트 처리 함수
    const onSearchWordChangeHandler = (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const value = event.target.value;
      setWord(value);
    };

    //이벤트 헨들러 : 검색어 키 이벤트 처리 함수
    const onSearchWordKeyDownHandler = (
      event: KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key !== "Enter") return;
      if (!searchButtonRef.current) return;
      searchButtonRef.current.click();
    };

    //이벤트 헨들러 : 검색 아이콘 글의 이벤트 처리 함수
    const onSearchButtonClickHandler = () => {
      if (!status) {
        setStatus(!status);
        return;
      }
      navigate(SEARCH_PATH(word));
    };

    // 이펙트 : 검색어 path variable 변경 될때 마다 실행되는 함수
    useEffect(() => {
      if (searchWord) {
        setWord(searchWord);
        setStatus(true);
      }
    }, [searchWord]);

    if (!status)
      // 렌더 : 검색 버튼 컴포넌트 렌더링 : false 상태
      return (
        <div className="icon-button" onClick={onSearchButtonClickHandler}>
          <div className="icon search-light-icon"></div>
        </div>
      );

    // 렌더 : 검색 버튼 컴포넌튼 렌더링 : true 상태
    return (
      <div className="header-search-input-box">
        <input
          className="header-search-input"
          type="text"
          placeholder="검색어를 입력해주세요."
          value={word}
          onChange={onSearchWordChangeHandler}
          onKeyDown={onSearchWordKeyDownHandler}
        />
        <div
          ref={searchButtonRef}
          className="icon-button"
          onClick={onSearchButtonClickHandler}
        >
          <div className="icon search-light-icon"></div>
        </div>
      </div>
    );
  };

  //컴포넌트 : 로그인, 로그아웃 또는 마이페이지 컴포넌트
  const MyPageButton = () => {
    // 상태 : userEmail Path variable 상태
    const { userEmail } = useParams();

    // 이벤트 헨들러 : 마이페이지 버튼 클릭 처리 함수
    const onMyPageButtonClickHandler = () => {
      if (!loginUser) return;
      const { email } = loginUser;
      navigate(USER_PATH(email));
    };

    // 이벤트 헨들러 : 로그인 버튼 클릭 처리 함수
    const onSignInButtonClickHandler = () => {
      navigate(AUTH_PATH());
    };

    // 이벤트 헨들러 : 로그아웃 버튼 클릭 처리 함수
    const onSigOutButtonClickHandler = () => {
      resetLoginUser();
      navigate(MAIN_PATH());
    };

    if (isLogin && userEmail === loginUser?.email)
      //렌더 : 로그아웃 버튼 렌더러 컴포넌트
      return (
        <div className="black-button" onClick={onSigOutButtonClickHandler}>
          {"로그아웃"}
        </div>
      );
    if (isLogin) {
      //렌더 : 마이페이지 버튼
      return (
        <div className="white-button" onClick={onMyPageButtonClickHandler}>
          {"마이페이지"}
        </div>
      );
    }
    //렌더 : 로그인 버튼 렌더러 컴포넌트
    return (
      <div className="black-button" onClick={onSignInButtonClickHandler}>
        {"로그인"}
      </div>
    );
  };

  //컴포넌트 : 업로드 버튼 컴포넌트
  const UploadButton = () => {
    //상태 : 게시물 상태
    const { title, content, boardImageFileList, resetBoard } = useBoardStore();

    //이벤트 헨들러 : 업로드 버튼 클릭 처리함수
    const onUploadButtonClickHandler = () => {};

    //렌더 : 업로드 버튼 렌더러
    if (title && content)
      return (
        <div className="black-button" onClick={onUploadButtonClickHandler}>
          {"업로드"}
        </div>
      );
    //렌더 : 업로드 불가 버튼 렌더러
    return <div className="disable-button">{"업로드"}</div>;
  };

  //이펙트 : 경로가 변경될 때 마다 실행되는 함수
  useEffect(() => {
    const isAuthPage = pathname.startsWith(AUTH_PATH());
    setAuthPage(isAuthPage);

    const isMainPage = pathname === MAIN_PATH();
    setMainPage(isMainPage);

    const isSearchPage = pathname.startsWith(SEARCH_PATH(""));
    setSearchPage(isSearchPage);

    const isBoardDetailPage = pathname.startsWith(
      BOARD_PATH() + "/" + BOARD_DETAIL_PATH("")
    );
    setBoardDetailPage(isBoardDetailPage);

    const isBoardWritePage = pathname.startsWith(BOARD_PATH() + "/" +BOARD_WRITE_PATH());
    setBoardWritePage(isBoardWritePage);

    const isBoardUpdatePage = pathname.startsWith(BOARD_PATH() + "/" +BOARD_UPDATE_PATH(""));
    setBoardUpdatePage(isBoardUpdatePage);

    const isUserPage = pathname.startsWith(USER_PATH(""));
    setUserPage(isUserPage);
  }, [pathname]);

  //렌더 : Header Layout 렌더러 컴포넌트
  return (
    <div id="header">
      <div className="header-container">
        <div className="header-left-box" onClick={onLogoClickHandler}>
          <div className="icon-box">
            <div className="icon logo-dark-icon"></div>
          </div>
          <div className="header-logo">{"catWashHub"}</div>
        </div>
        <div className="header-right-box">
          {(isAuthPage || isMainPage || isSearchPage || isBoardDetailPage) && (
            <SearchButton />
          )}
          {(isMainPage || isSearchPage || isBoardDetailPage || isUserPage) && (
            <MyPageButton />
          )}
          {(isBoardWritePage || isBoardUpdatePage) && <UploadButton />}
        </div>
      </div>
    </div>
  );
}
