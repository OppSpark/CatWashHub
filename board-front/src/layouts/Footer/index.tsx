import React from "react";
import "./style.css";

// 캄포넌트 : Footer layout 컴포넌트
export default function Footer() {
  //이벤트 헨들러 Insta Icon 버튼 클릭 처리
  const onInstaIconButtonClickHandler = () => {
    window.open("https://instagram.com");
  };

  //이벤트 헨들러 Blog Icon 버튼 클릭 처리
  const onKakaoIconButtonHandler = () => {
    window.open("https://kakao.com");
  };

  // 렌더 Footer layout 렌더러 컴포넌트
  return (
    <div id="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo-box">
            <div className="icon-box">
              <div className="icon logo-light-icon"></div>
            </div>
            <div className="footer-logo-text">{"catWashHub"}</div>
          </div>
          <div className="footer-link-box">
            <div className="footer-email-link">{"catWash@oppspark.net"}</div>
            <div className="icon-button">
              <div
                className="icon insta-icon"
                onClick={onInstaIconButtonClickHandler}
              ></div>
            </div>
            <div className="icon-button">
              <div
                className="icon kakao-icon"
                onClick={onKakaoIconButtonHandler}
              ></div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">
            {"catWashHub © 2024. 함께 만드는 빛나는 자동차 문화."}
          </div>
        </div>
      </div>
    </div>
  );
}
