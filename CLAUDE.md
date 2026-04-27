# 프로젝트 개요
- 프론트엔드: React + TypeScript
- 백엔드: Java 17 + Spring Boot 3
- DB: MySQL
- 배포: Oracle Cloud

# 기본 규칙
- 모든 대화는 **한국어**로
- 코드 주석은 **한국어**로
- 큰 작업 전엔 **계획 먼저** 보여줄 것
- 작업 단위로 **커밋** 할 것

# 작업 규칙
- 프론트엔드: Vite + React + TypeScript
- UI: Tailwind CSS + shadcn/ui
- 디자인 컨셉: 토스 스타일 (모바일 우선 반응형)
- 주요 색상:
  - 배경: #F2F4F6
  - 텍스트: #191F28
  - 포인트: #3182F6
- 페이지 구성: 로그인/회원가입 → 홈(피드) → 희석계산기 → 세차기록 → 마이페이지


---

# ☕ Java Spring 코딩 스탠다드

## 네이밍 규칙

```java
// 클래스: PascalCase
public class PatientInfo { }

// DTO: 용도 명시
public class PatientInfoDto { }
public class PatientInfoRequest { }
public class PatientInfoResponse { }

// 인터페이스: prefix 없이 PascalCase
public interface PatientCall { }

// public 메서드: camelCase + 동사+명사 형태
public String getPatientName() { }   // 반환값 O
public void setPatientName() { }     // 반환값 X
public boolean isFamily() { }        // 존재 유무 확인
public boolean checkPatAge() { }     // 정보 체크


// 전역변수: m_ prefix + PascalCase
private String m_chartNo = "";
// 전역변수 Getter/Setter
public String getM_chartNo() { return m_Chartno; }
public void setM_chartNo(String value) { m_Chartno = value; }

// 지역변수: camelCase
String chartno = "";

// 매개변수: _ prefix
private void setPatName(String _chartno) { }

// 상수: c_ prefix + PascalCase
private static final String PATIENT_NAME = "Patnm";
private static final int c_Column = 0;
```

## 예외처리

```java
// 올바른 예시 — try-catch-finally
public void setPatientList() {
    try (ResultSet rs = query.executeQuery(sql)) {
        if (rs.next()) { /* 처리 */ }
    } catch (Exception ex) {
        throw new CustomException(ErrorCode.DB_ERROR, ex.getMessage());
    }
}

// 예외처리는 GlobalExceptionHandler 한 곳에서만
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ApiResponse<?> handleUserNotFound(UserNotFoundException e) {
        return ApiResponse.fail(e.getMessage());
    }
}
```

## 변수 선언 위치

```java
// 잘못된 예시 — 상위 선언 후 중복할당 (경고 발생)
private void setInsuranceList() {
    List<Insurance> list = null;
    try {
        list = insuranceRepository.findAll(); // 중복할당
    } catch (Exception ex) {
        throw ex;
    }
}

// 올바른 예시 — 사용하는 위치에서 선언
private void setInsuranceList() {
    try {
        List<Insurance> list = insuranceRepository.findAll();
    } catch (Exception ex) {
        throw ex;
    }
}
```

## 메서드 오버로딩 규칙

```java
// 매개변수 없는 메서드는 최종 메서드를 호출
public boolean isNormalized() {
    return isNormalized("FormC"); // 아래 메서드 호출
}

// 매개변수 많은 메서드에서 실제 로직 구현
public boolean isNormalized(String form) {
    // 실제 로직 구현
    return true;
}
```

## IF문 규칙

```java
// 잘못된 예시 — 중괄호 없음
if (!m_Chartno.isEmpty())
    isCheck = false;

// 올바른 예시 — 중괄호 필수
if (!m_Chartno.isEmpty()) {
    isCheck = false;
}
```

## DTO는 record 사용 (Java 17+)

```java
public record UserResponse(Long id, String email, String name) { }

// 공통 API 응답 포맷
public record ApiResponse<T>(boolean success, T data, String message) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```

## 클래스 내부 정리 순서

```java
public class PatientService {

    private String m_Chartno = "";

    // ==================== 상수 ====================
    private static final String PATIENT_NAME = "Patnm";

    // ==================== 생성자 ====================
    public PatientService() { }

    // ==================== Override ====================
    @Override
    public String toString() { return m_Chartno; }

    // ==================== 초기화 함수 ====================
    private void initEdit() { }
    private void initDisplay() { }

    // ==================== 기능별 함수 ====================
    public String getPatientName() { return ""; }
}
```

## 패키지 구조

```
com.myproject/
├── config/          ← 설정 파일 (Security, WebMvc, Swagger, Redis 등)
├── common/          ← 전역 공통 요소 (상수, 공통 Enum, ApiResponse 등)
├── security/        ← 인증/인가 로직 (JWT 필터, UserDetails 등)
├── util/            ← 유틸리티 클래스 (DateUtil, StringUtil, 암호화 등)
├── mapper/          ← Entity <-> DTO 변환 (MapStruct 등 사용 시)
├── controller/      ← API 엔드포인트
├── service/         ← 비즈니스 로직
├── repository/      ← DB 접근
├── domain/          ← Entity
├── dto/             ← Request/Response (record 사용)
│   ├── request/
│   └── response/
└── exception/       ← GlobalExceptionHandler
```

---

# React + TypeScript 코딩 스탠다드

## 네이밍 규칙

```typescript
// 컴포넌트: PascalCase
const PatientCard = () => { }

// 인터페이스: prefix 없이 PascalCase
interface PatientCall { }

// Props 타입
interface PatientCardProps {
    chartno: string;
    onSelect?: (id: number) => void;
}

// 커스텀 훅: use prefix + camelCase
const usePatientData = () => { }

// 함수: camelCase + 동사+명사
const getPatientName = () => { }
const setPatientName = () => { }
const isFamily = () => { }
const checkPatAge = () => { }

// 전역 상태: m_ prefix
const [chartNo, setChartNo] = useState("");

// 지역변수: camelCase
const chartNo = "";

// 상수: c_ prefix + PascalCase
const c_PatientName = "Patnm";
const c_Column = 0;
```

## 텍스트 모듈화 및 메시지 관리
- 알림 메시지, 플레이스홀더등은 하드코딩하지 않고 src/constants/messages.ts에서 관리한다.

```typescript
// src/constants/messages.ts
export const AUTH_MSGS = {
    SIGNUP_SUCCESS: "회원가입이 완료되었습니다. 로그인 해주세요.",
    LOGIN_REQUIRED: "로그인이 필요한 서비스입니다.",
    ERROR_AGREEMENT: "이용약관에 동의해주세요."
};
```

## 스타일링 규칙
- CSS Modules (.module.css) 또는 Tailwind CSS를 사용하여 로직과 스타일을 완전히 분리한다.

## Props 타입 정의

```typescript
// Props 항상 interface로 정의
interface PatientCardProps {
    chartno: string;
    onSelect?: (id: number) => void;
}

const PatientCard = ({ chartno, onSelect }: PatientCardProps) => {
    return <div>{chartno}</div>;
}
```

## 타입 가드 활용 (instanceof 대응)

```typescript
// 잘못된 예시
const modelToEdit = (sender: unknown) => {
    const model = sender as PatientModel;
    if (model !== null) { }
}

// 올바른 예시
const modelToEdit = (sender: unknown) => {
    if (sender instanceof PatientModel) {
        setPatientList(sender.m_Chartno);
    }
}
```

## 메서드 오버로딩

```typescript
// 선언부로 오버로딩 처리
function isNormalized(): boolean;
function isNormalized(form: string): boolean;
function isNormalized(form?: string): boolean {
    const _form = form ?? "FormC"; // 기본값 처리
    return _form === "FormC";
}
```

## IF문 규칙

```typescript
// 잘못된 예시
if (m_Chartno !== "") isCheck = false;

// 올바른 예시 — 중괄호 필수
if (m_Chartno !== "") {
    isCheck = false;
}
```

## API 호출 분리

```typescript
// api/patientApi.ts
export const getPatient = async (id: number): Promise<Patient> => {
    const res = await axios.get(`/api/patients/${id}`);
    return res.data;
}
```

## 폴더 구조

```
src/
├── assets/        ← 이미지, 폰트, 아이콘 등 정적 리소스
├── constants/     ← 전역 상수, 설정값, 공통 코드 체계 등
├── layouts/       ← 페이지 공통 레이아웃 (헤더, 사이드바, 네비게이션 등)
├── routes/        ← 라우팅 설정 파일 모음 (React Router 등)
├── store/         ← 전역 상태 관리 (Zustand, Redux, Recoil 등)
├── components/    ← 공통 UI 컴포넌트 (버튼, 모달, 데이터 그리드 등)
├── pages/         ← 라우터와 매핑되는 개별 화면 (로그인 화면, 환자 목록 등)
├── hooks/         ← 재사용 가능한 커스텀 훅 모음 (use prefix 사용)
├── api/           ← 백엔드 서버 통신용 API 호출 함수 모음
├── types/         ← TypeScript 타입 및 인터페이스 (Entity, DTO 매핑 등)
└── utils/         ← 상태가 없는 순수 유틸리티 함수 (날짜 변환, 포맷팅 등)
```

---

# Git 규칙

## 커밋 메시지 (Conventional Commits)

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 코드 개선 (기능 변화 없음)
docs: 문서 수정
style: 포매팅 (기능 변화 없음)
test: 테스트 추가
chore: 빌드/설정 변경
```

예시:
```
feat: 회원가입 API 추가
fix: 로그인 토큰 만료 오류 수정
refactor: PatientService 중복 코드 제거
```

## 브랜치 전략

```
main        ← 배포용 (직접 push 금지)
develop     ← 개발 통합
feat/기능명  ← 기능 개발
fix/버그명   ← 버그 수정
```

예시:
```
feat/user-login
feat/patient-list
fix/token-refresh-error
```

---

# 자주 쓰는 명령어

```bash
# 프론트 실행
cd frontend && npm run dev

# 백엔드 실행
cd backend && ./gradlew bootRun

# 테스트
./gradlew test

# 빌드
./gradlew build
```

---

# 작업 플로우

1. `feat/기능명` 브랜치 생성
2. 큰 작업은 계획 먼저 보여줄 것
3. 작업 단위로 커밋
4. `/review` 로 코드 리뷰
5. develop 브랜치에 머지
