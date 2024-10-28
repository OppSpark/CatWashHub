import React, { useState, useRef, KeyboardEvent } from "react";
import "./style.css";
import InputBox from "components/InputBox";

//컴포넌트 : 인증 화면 컴포넌트
export default function Authentication() {
  //상태 : 화면 상태
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");

  //컴포넌트 : sign in card 컴포넌트
  const SignInCard = () => {
    //상태 : 이메일 요소 참조 상태
    const emailRef = useRef<HTMLInputElement | null>(null);

    //상태 : 이메일 요소 참조 상태
    const passwordRef = useRef<HTMLInputElement | null>(null);

    //상태 : 이메일 상태
    const [email, setEmail] = useState<string>("");

    //상태 : 비밀반호 상태
    const [password, setPassword] = useState<string>("");

    //상태 : 패스워드 타잆 상태
    const [passwordType, setPasswordType] = useState<"text" | "password">(
      "password"
    );

    //상태 : 패스워드 버튼 아이콘 상태
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<
      "eye-light-off-icon" | "eye-light-on-icon"
    >("eye-light-off-icon");

    //상태 : 에러상태
    const [error, setError] = useState<boolean>(false);

    //이벤트 헨들러 : 로그인 버튼 클릭 이벤트 처리 함수
    const onSignInButtonClickHandler = () => {};

    //이벤트 헨들러 : 회원가입 링크 클릭 이벤트 처리
    const onSignUpLinkClickHandler = () => {
      setView("sign-up");
    };

    const onPasswordButtonClickHandler = () => {
      if (passwordType === "text") {
        setPasswordType("password");
        setPasswordButtonIcon("eye-light-off-icon");
      } else {
        setPasswordType("text");
        setPasswordButtonIcon("eye-light-on-icon");
      }
    };

    //이벤트 헨드러 : 이메일 input keyDown 이벤트 처리
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      if (!passwordRef.current) return;
      passwordRef.current.focus();
      onSignInButtonClickHandler();
    };

    //이벤트 헨드러 : 패스워드 input keyDown 이벤트 처리
    const onPasswordKeyDownHandler = (
      event: KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key !== "Enter") return;
    };

    return (
      <div className="auth-card">
        <div className="auth-card-box">
          <div className="auth-card-top">
            <div className="auth-card-title-box">
              <div
                className="auth-card-title"
                onClick={onSignInButtonClickHandler}
              >
                {"로그인"}
              </div>
            </div>
            <InputBox
              ref={emailRef}
              label="이메일주소"
              type="text"
              placeholder="이메일 주소를 입력해주세요."
              error={error}
              value={email}
              setValue={setEmail}
              onKeyDown={onEmailKeyDownHandler}
            />
            <InputBox
              ref={passwordRef}
              label="패스워드"
              type={passwordType}
              placeholder="비밀번호를 입력해주세요."
              error={error}
              value={password}
              setValue={setPassword}
              icon={passwordButtonIcon}
              onButtonClick={onPasswordButtonClickHandler}
              onKeyDown={onPasswordKeyDownHandler}
            />
          </div>
          <div className="auth-card-bottom">
            {error && (
              <div className="auth-sign-in-error-box">
                <div className="auth-sign-in-error-message">
                  {
                    "이메일 주소 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요"
                  }
                </div>
              </div>
            )}
            <div className="black-large-full-button">{"로그인"}</div>
            <div className="auth-description-box">
              <div className="auth-description">
                {"신규 사용자이신가요?"}{" "}
                <span
                  className="auth-description-link"
                  onClick={onSignUpLinkClickHandler}
                >
                  {"회원가입"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //컴포넌트 : sign iup card 컴포넌트
  const SignUpCard = () => {
    return <div className="auth-card"></div>;
  };

  //렌더 : 컴포넌트 렌더링
  return (
    <div id="auth-wrapper">
      <div className="auth-container">
        <div className="auth-jumbotron-box">
          <div className="auth-jumbotron-contents">
            <div className="auth-logo-icon"></div>
            <div className="auth-jumbotron-text-box">
              <div className="auth-jumbotron-text">{"catWashHub"}</div>
              <div className="auth-jumbotron-text">{"모두의 세차공간"}</div>
            </div>
          </div>
        </div>
        {view === "sign-in" && <SignInCard />}
        {view === "sign-up" && <SignUpCard />}
      </div>
    </div>
  );
}
