import React, { useState } from "react";
import "./style.css";

//컴포넌트 : 인증 화면 컴포넌트
export default function Authentication() {
  //상태 : 화면 상태
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");

  //컴포넌트 : sign in card 컴포넌트
  const SignInCard = () => {
    return <div className="auth-card"></div>;
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
              <div className="auth-jumbotron-text">
                {"모두의 세차공간"}
              </div>
            </div>
          </div>
        </div>
        {view === "sign-in" && <SignInCard />}
        {view === "sign-up" && <SignUpCard />}
      </div>
    </div>
  );
}
