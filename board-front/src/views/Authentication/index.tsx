import React, { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import "./style.css";
import InputBox from "components/InputBox";
import { SignInRequestDto } from "apis/request/auth";
import { signInRequest } from "apis";
import { SignInResponseDto } from "apis/response/auth";
import { ResponseDto } from "apis/response";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { MAIN_PATH } from "constants/";

//컴포넌트 : 인증 화면 컴포넌트
export default function Authentication() {
  //상태 : 화면 상태
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");

  //상태 : 쿠키 상태
  const [cookies, setCookie] = useCookies();

  //함수 : 네비게이터
  const navigator = useNavigate();

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

    //함수 : sign in response 처리
    const signInResponse = (
      responseBody: SignInResponseDto | ResponseDto | null
    ) => {
      if (!responseBody) {
        alert("네트워크 이상입니다.");
        return;
      }
      const { code } = responseBody;
      if (code === "DBE") alert("데이터베이스 오류입니다.");
      if (code === "SF" || code === "VF") setError(true);
      if (code === "SU") {
        const { token, expirationTime } = responseBody as SignInResponseDto;

        const now = new Date().getTime();
        const expires = new Date(now + expirationTime * 1000);

        setCookie("accessToken", token, { expires, path: MAIN_PATH() });

        navigator(MAIN_PATH());
      }
    };

    //이벤트 핸들러 : 이메일 변경 이벤트 처리
    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setError(false);
      const { value } = event.target;
      setEmail(value);
    };

    //이벤트 핸들러 : 비밀번호 변경 이벤트 처리
    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setError(false);
      const { value } = event.target;
      setPassword(value);
    };

    //이벤트 헨들러 : 로그인 버튼 클릭 이벤트 처리 함수
    const onSignInButtonClickHandler = () => {
      const requestBody: SignInRequestDto = { email, password };
      signInRequest(requestBody).then(signInResponse);
    };

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

    //이벤트 핸들러 : 이메일 input keyDown 이벤트 처리
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      if (!passwordRef.current) return;
      passwordRef.current.focus();
      onSignInButtonClickHandler();
    };

    //이벤트 핸들러 : 패스워드 input keyDown 이벤트 처리
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
              onChange={onEmailChangeHandler}
              onKeyDown={onEmailKeyDownHandler}
            />
            <InputBox
              ref={passwordRef}
              label="패스워드"
              type={passwordType}
              placeholder="비밀번호를 입력해주세요."
              error={error}
              value={password}
              onChange={onPasswordChangeHandler}
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
            <div
              className="black-large-full-button"
              onClick={onSignInButtonClickHandler}
            >
              {"로그인"}
            </div>
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

  //컴포넌트 : sign up card 컴포넌트
  const SignUpCard = () => {
    //상태 : 이메일 요소 참조 상태
    const emailRef = useRef<HTMLInputElement | null>(null);

    //상태 : 비밀번호 요소 참조 상태
    const passwordRef = useRef<HTMLInputElement | null>(null);

    //상태 : 비밀번호 확인 요소 참조 상태
    const passwordCheckRef = useRef<HTMLInputElement | null>(null);

    //상태 : 페이지 번호 상태
    const [page, setPage] = useState<1 | 2>(1);

    //상태 : 이메일 상태
    const [email, setEmail] = useState<string>("");

    //상태 : 비밀번호 상태
    const [password, setPassword] = useState<string>("");

    //상태 : 비밀번호 확인 상태
    const [passwordCheck, setPasswordCheck] = useState<string>("");

    //상태 :페스워드 타입 상태
    const [passwordType, setPasswordType] = useState<"text" | "password">(
      "password"
    );

    //상태 : 페스워드 확인 타입 상태
    const [passwordCheckType, setPasswordCheckType] = useState<
      "text" | "password"
    >("password");

    //상태 : 이메일 에러 상태
    const [isEmailError, setEmailError] = useState<boolean>(false);

    //상태 : 비밀번호 에러 상태
    const [isPasswordError, setPasswordError] = useState<boolean>(false);

    //상태 : 비밀번호 확인 에러 상태
    const [isPasswordCheckError, setPasswordCheckError] =
      useState<boolean>(false);

    //상태 : 이메일 에러 메시지 상태
    const [emailErrorMessage, setEmailErrorMessage] = useState<string>("");

    //상태 : 비밀번호 에러 메시지 상태
    const [passwordErrorMessage, setPasswordErrorMessage] =
      useState<string>("");

    //상태 : 비밀번호 확인 에러 메시지 상태
    const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] =
      useState<string>("");

    //상태 : 비밀번호 아이콘 상태
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<
      "eye-light-off-icon" | "eye-light-on-icon"
    >("eye-light-off-icon");

    //상태 : 비밀번호 확인 버튼 아이콘 상태
    const [passwordCheckButtonIcon, setPasswordCheckButtonIcon] = useState<
      "eye-light-off-icon" | "eye-light-on-icon"
    >("eye-light-off-icon");

    //이벤트 헨들러 : 이메일 변경 이벤드 처리
    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setEmail(value);
    };

    //이벤트 헨들러 : 비밀번호 변경 이벤드 처리
    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPassword(value);
    };

    //이벤트 헨들러 : 비밀번호 확인 변경 이벤드 처리
    const onPasswordCheckChangeHandler = (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const { value } = event.target;
      setPasswordCheck(value);
    };

    //이벤트 헨들러 : 비밀번호 버튼 클릭 이벤트 처리
    const onPasswordButtonClickHandler = () => {
      if (passwordButtonIcon === "eye-light-off-icon") {
        setPasswordButtonIcon("eye-light-on-icon");
        setPasswordType("text");
      } else {
        setPasswordButtonIcon("eye-light-off-icon");
        setPasswordType("password");
      }
    };

    //이벤트 헨들러 : 비밀번호 확인 버튼 클릭 이벤트 처리
    const onPasswordCheckButtonClickHandler = () => {
      if (passwordButtonIcon === "eye-light-off-icon") {
        setPasswordCheckButtonIcon("eye-light-on-icon");
        setPasswordCheckType("text");
      } else {
        setPasswordCheckButtonIcon("eye-light-off-icon");
        setPasswordCheckType("password");
      }
    };

    //이벤트 헨들러 : 다음 단계 버튼 클릭 이벤트 처리
    const onNextButtonClickHandler = () => {
      const emailPattern = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+(\.[a-zA-Z]{2,4})$/;
      const isEmailPattern = emailPattern.test(email);
      if (!isEmailPattern) {
        setEmailError(true);
        setEmailErrorMessage("이메일 주소 포멧이 맞지 않습니다.");
      }

      const isCheckedPassword = password.trim().length >= 8;
      if (!isCheckedPassword) {
        setPasswordError(true);
        setPasswordErrorMessage("비밀번호는 8자 이상 입력해주세요.");
      }

      const isEqualPassword = password === passwordCheck;
      if (!isEqualPassword) {
        setPasswordCheckError(true);
        setPasswordCheckErrorMessage("비밀번호가 일치하지 않습니다.");
      }
      if (!isEmailPattern || !isCheckedPassword || !isEqualPassword) return;

      setPage(2);
    };

    //이벤트 핸들러 : 이메일 input keyDown 이벤트 처리
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      if (!passwordRef.current) return;
      passwordRef.current.focus();
    };

    //이벤트 핸들러 : 비밀번호 input keyDown 이벤트 처리
    const onPasswordKeyDownHandler = (
      event: KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key !== "Enter") return;
      if (!passwordCheckRef.current) return;
      passwordCheckRef.current.focus();
    };

    //이벤트 핸들러 : 비밀번호 확인 input keyDown 이벤트 처리
    const onPasswordCheckKeyDownHandler = (
      event: KeyboardEvent<HTMLInputElement>
    ) => {
      if(event.key !== 'Enter')
        return;
      onNextButtonClickHandler();
    };

    // 렌더 : sign up card 컴포넌트 렌더링
    return (
      <div className="auth-card">
        <div className="auth-card-box">
          <div className="auth-card-top">
            <div className="auth-card-title-box">
              <div className="auth-card-title">{"회원가입"}</div>
              <div className="auth-card-page">{`1/2`}</div>
            </div>
            <InputBox
              ref={emailRef}
              label="이메일 주소*"
              type="text"
              placeholder="이메일 주소를 입력해주세요."
              value={email}
              onChange={onEmailChangeHandler}
              error={isEmailError}
              message={emailErrorMessage}
              onKeyDown={onEmailKeyDownHandler}
            />
            <InputBox
              ref={passwordRef}
              label="비밀번호*"
              type={passwordType}
              placeholder="비밀번호를 입력해주세요."
              value={password}
              onChange={onPasswordChangeHandler}
              error={isPasswordError}
              message={passwordErrorMessage}
              icon={passwordButtonIcon}
              onButtonClick={onPasswordButtonClickHandler}
              onKeyDown={onPasswordKeyDownHandler}
            />
            <InputBox
              ref={passwordCheckRef}
              label="비밀번호 확인*"
              type={passwordCheckType}
              placeholder="비밀번호를 다시 입력해주세요."
              value={passwordCheck}
              onChange={onPasswordCheckChangeHandler}
              error={isPasswordCheckError}
              message={passwordCheckErrorMessage}
              icon={passwordCheckButtonIcon}
              onButtonClick={onPasswordCheckButtonClickHandler}
              onKeyDown={onPasswordCheckKeyDownHandler}
            />
          </div>
          <div className="auth-card-bottom">
            <div
              className="black-large-full-bottom"
              onClick={onNextButtonClickHandler}
            >
              {"다음 단계"}
            </div>
            <div className="auth-description">
              {"이미 계정이 있으신가요?"}
              <span className="auth-description-link">{"로그인"}</span>
            </div>
          </div>
        </div>
      </div>
    );
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
