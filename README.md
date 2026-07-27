# 복지나침반

노약자와 시각장애인이 자신의 상황을 입력하면, 미리 검증된 복지정책 목록 안에서
확인해 볼 만한 복지서비스를 추천해 주는 AI 안내 웹앱입니다.

이 앱은 **실제 복지 수급 자격을 확정하지 않습니다.** AI는 `data/welfarePolicies.js`에
있는 정책 안에서만 추천하며, 목록 밖의 정책을 만들어내지 않도록 프롬프트와 서버
쪽 필터링으로 이중 제한합니다.

## 파일 구조

```
/
├── index.html              # 프론트엔드 (폼 입력, 결과 카드, 음성 읽기)
├── data/
│   └── welfarePolicies.js  # AI에게 전달되는 유일한 복지정책 데이터 (예시 2건)
├── api/
│   └── generate.js         # Gemini API를 호출하는 Vercel 서버리스 함수
├── package.json
└── README.md
```

## 동작 방식

1. 사용자가 `index.html`의 폼(나이, 거주지역, 장애 여부, 1인 가구 여부, 소득 상황,
   가장 필요한 도움, 자유 입력)을 채우고 "맞춤 복지 찾아보기"를 누릅니다.
2. 프론트엔드는 입력값만 `/api/generate`(서버리스 함수)로 전송합니다.
3. `api/generate.js`가 `data/welfarePolicies.js`의 정책 목록과 사용자 입력을 함께
   Gemini API(`gemini-3.1-flash-lite`, `temperature: 0.1`)에 전달하고, 구조화된 출력
   (JSON 스키마)으로만 응답받도록 요청합니다.
4. 서버는 응답의 `officialAgency`/`officialUrl`이 우리 데이터에 실제로 존재하는
   값인지 다시 한번 검증한 뒤, 최대 3개까지만 프론트엔드로 돌려줍니다.
5. 프론트엔드는 정책별 카드로 결과를 보여주고, 원하면 음성으로 읽어줍니다.

## 복지정책 데이터 교체하기

`data/welfarePolicies.js`에는 지금 예시 정책 2건만 들어있습니다. 실제 서비스로
쓰려면 이 파일 안의 배열(`welfarePolicies`)에 우리 팀이 조사·검증한 정책을 같은
형식(`id`, `name`, `targetSummary`, `eligibilityNotes`, `supportContent`,
`applicationMethod`, `officialAgency`, `officialUrl`)으로 추가하거나 교체하면
됩니다. **이 파일에 없는 정책은 AI가 추천할 수 없습니다.**

## 접근성 기능

- 기본 글씨 크기 확대, 버튼 크게, 고대비 색상
- 모든 입력창에 `label` 연결, 라디오 그룹에 `role="radiogroup"` 적용
- 마우스 없이 키보드(Tab, Space, Enter)만으로 전체 조작 가능, 초점(focus) 표시 강조
- 결과를 음성으로 읽어주는 "🔊 결과 읽어주기" / "⏹ 읽기 중지" 버튼
  (브라우저 내장 `SpeechSynthesis` 사용, 별도 서버 비용 없음)
- 로딩 상태와 오류를 화면 낭독기가 읽을 수 있도록 `aria-live` 영역으로 안내
- 오류 메시지는 쉬운 한국어로 표시

## 로컬에서 실행하기 (선택)

Vercel CLI가 설치되어 있다면 아래 명령으로 로컬에서 API 라우트를 포함해
테스트할 수 있습니다.

```bash
npm install -g vercel
vercel dev
```

`.env` 파일 또는 셸 환경변수에 아래 값을 설정해야 합니다.

```
GEMINI_API_KEY=여기에_실제_API_키
```

## GitHub 업로드 순서

1. 이 폴더(`welfare-compass`)를 새 Git 저장소로 초기화합니다.
   ```bash
   git init
   git add .
   git commit -m "복지나침반 초기 버전"
   ```
2. GitHub에 새 저장소를 만듭니다. (예: `welfare-compass`)
3. 원격 저장소를 연결하고 push 합니다.
   ```bash
   git remote add origin https://github.com/사용자명/welfare-compass.git
   git branch -M main
   git push -u origin main
   ```

## Vercel 배포 순서

1. [vercel.com](https://vercel.com)에 로그인한 뒤 "Add New… → Project"를 선택합니다.
2. 방금 push한 GitHub 저장소(`welfare-compass`)를 가져오기(Import)합니다.
3. Framework Preset은 별도 프레임워크가 없으므로 "Other"로 두어도 됩니다.
   (`index.html`은 정적 파일로, `api/generate.js`는 서버리스 함수로 자동 인식됩니다.)
4. "Environment Variables"에서 아래 값을 추가합니다.
   - Key: `GEMINI_API_KEY`
   - Value: 실제 Gemini API 키
5. "Deploy"를 눌러 배포합니다. 배포가 끝나면 발급된 주소로 접속해 정상 동작을
   확인합니다.
6. 이후 `data/welfarePolicies.js`를 실제 조사한 정책으로 교체할 때마다 GitHub에
   push하면 Vercel이 자동으로 다시 배포합니다.
