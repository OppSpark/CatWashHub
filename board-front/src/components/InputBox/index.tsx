import {
  ChangeEvent,
  Dispatch,
  forwardRef,
  SetStateAction,
  KeyboardEvent,
} from "react";
import "./style.css";

//  인터페이스
interface Props {
  label: string;
  type: "text" | "password";
  placeholder: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  error: boolean;

  icon?: 'eye-light-off-icon' | 'eye-light-on-icon' | 'eye-light-light-icon';
  onButtonClick?: () => void;

  message?: string;

  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

// 컴포넌트 : Input Box 컴포넌트
const inputBox = forwardRef<HTMLInputElement, Props>((props: Props, ref) => {
  //프로퍼티스
  const { label, type, placeholder, value, error, icon, message } = props;
  const { setValue, onButtonClick, onKeyDown } = props;

  //이벤트 헨들러 input 값 변경 처리 함수
  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValue(value);
  };

  // 이벤트 헨들러 keyEvent 헨들러 처리함수 (엔터)
  const onKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!onKeyDown) return;
    onKeyDown(event);
  };

  // 렌더 Input Box 컴포넌트
  return (
    <div className="inputbox">
      <div className="inputbox-lable">{label}</div>
      <div
        className={error ? "inputbox-container-error" : "inputbox-container"}
      >
        <input
          ref={ref}
          type={type}
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={onChangeHandler}
          onKeyDown={onKeyDownHandler}
        />
        {onButtonClick !== undefined && (
          <div className="icon-button" onClick={onButtonClick}>
            {icon !== undefined && <div className={`icon ${icon}`}></div>}
          </div>
        )}
      </div>
      {message !== undefined && (
        <div className="inputbox-message">{message}</div>
      )}
    </div>
  );
});

export default inputBox;
