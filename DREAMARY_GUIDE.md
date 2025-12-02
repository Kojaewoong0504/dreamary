# 📘 Dreamary 개발 가이드: 모바일 PWA 웹 앱 Ver.

이 문서는 꿈 기록 및 AI 시각화 서비스 **'Dreamary'**를 **모바일 퍼스트 웹 앱(PWA)**으로 개발하기 위한 실전 가이드입니다.

---

## 1. 프로젝트 기획 단계 (App Structure)

### 1.1 핵심 정의 (Core Definition)
* **프로젝트명:** Dreamary (Dream + Diary)
* **플랫폼 형태:** **Mobile Web App (PWA)**
    * 모바일 브라우저에서 접속하지만, 앱처럼 설치되고 작동함.
    * 데스크톱 접속 시 모바일 뷰(width: 430px)가 중앙에 뜨는 형태.
* **핵심 가치:** "휘발되는 꿈을 AI가 시각화하여 영원히 기록한다."

### 1.2 앱 구조 및 네비게이션 (Sitemap)
마케팅 페이지가 아닌, **실제 앱의 UX**를 따릅니다.

1.  **Splash Screen:** 앱 실행 시 로고 애니메이션 (1.5초).
2.  **App Shell (Layout):**
    * **Top Bar:** 로고, 알림 아이콘.
    * **Bottom Navigation:** [홈] - [검색] - [기록(+)] - [보관함] - [마이페이지].
3.  **Home (Feed):** 다른 사람들의 꿈 그림이 세로로 흐르는 피드 (인스타그램/릴스 스타일).
4.  **Write (Create):** 꿈 내용을 텍스트로 입력하고 스타일을 선택하는 핵심 기능.
5.  **Dream Detail:** 생성된 이미지 확대 보기 + AI 해몽 텍스트 읽기.
6.  **My Page:** 나의 꿈 기록을 앨범(Grid) 형태로 모아보기.

### 1.3 디자인 컨셉 (Design System)
* **테마:** **Deep Dark & Neon** (심해/우주 느낌의 다크모드).
* **Color Palette:**
    * `Background`: **#0f172a** (Midnight Blue)
    * `Primary`: **#a855f7** (Dreamy Purple)
    * `Secondary`: **#22d3ee** (Aurora Cyan)
    * `Text`: **#f8fafc** (White)
* **UI 특징:** Glassmorphism(유리 효과), Floating Animation(부유감).

---

## 2. AI 협업을 위한 핵심 프롬프트 (Prompts)

### 2.1 초기 셋팅 프롬프트 (Initial Setup)
**이 프롬프트를 가장 먼저 입력하여 프로젝트의 뼈대를 잡으세요.**

> "Next.js 14 (App Router), Tailwind CSS, Supabase를 사용하여 'Dreamary'라는 **모바일 퍼스트 PWA 웹 앱**을 구축해줘.
>
> [핵심 요구사항]
> 1. 레이아웃 (App Shell): 
>    - 모바일 앱처럼 상단 헤더(Header)와 하단 네비게이션 바(Bottom Nav)가 고정된 구조(Layout.tsx)를 만들어줘.
>    - 데스크톱에서 접속 시, 모바일 화면 크기(max-width: 430px)로 중앙에 배치되고 배경은 흐릿하게 처리된 UI를 제공해줘.
> 2. 테마: 
>    - 전체 배경색은 Deep Dark(#0f172a).
>    - 네이티브 앱 같은 터치감과 트랜지션 (Framer Motion 활용).
> 3. PWA 설정:
>    - manifest.json 설정 및 모바일 뷰포트(viewport-fit=cover) 대응 필수.
>
> 먼저 **모바일 앱 구조에 최적화된 폴더 구조**를 제안하고, **Bottom Navigation Component** 코드를 작성해줘."

### 2.2 화면별 구현 프롬프트

**A. 홈 피드 (Home Feed):**
> "인스타그램처럼 세로로 스크롤되는 'Home Feed' 컴포넌트를 만들어줘.
> - 각 카드는 꿈 이미지(4:5 비율)가 꽉 차게 보여야 해.
> - 이미지 하단에 그라데이션 오버레이를 깔고, 꿈 제목과 작성자 닉네임을 표시해줘.
> - 스크롤은 부드럽게 넘어가야 해 (Snap scroll 고려)."

**B. 꿈 기록 폼 (Write Page):**
> "꿈 내용을 입력하는 'WritePage'를 만들어줘.
> - 텍스트 입력창(Textarea)은 화면의 50%를 차지하고, 플레이스홀더로 '어젯밤 어떤 꿈을 꾸셨나요?'를 넣어줘.
> - 하단에는 '화풍 선택(수채화, 사이버펑크 등)' 칩 버튼을 가로 스크롤로 배치해줘.
> - 키보드가 올라왔을 때 UI가 깨지지 않도록 `dvh`(Dynamic Viewport Height) 단위를 사용해줘."

---

## 3. 개발 프로세스 (Roadmap)

### 3.1 기술 스택 및 환경
* **Framework:** Next.js (App Router)
* **Database & Auth:** Supabase
* **Styling:** Tailwind CSS + Framer Motion
* **AI:** OpenAI API (DALL-E 3, GPT-4o-mini)
* **State Management:** Zustand (가벼운 상태 관리 추천)

### 3.2 개발 순서 (Step-by-Step)
1.  **Layout 구축:** 모바일 레이아웃(430px 제한)과 Bottom Nav가 작동하는 껍데기 완성.
2.  **Auth 연동:** Supabase 소셜 로그인(구글/카카오) 붙이기.
3.  **Core Logic (Write):** 꿈 텍스트 입력 -> OpenAI API 호출 -> 결과 이미지 수신 로직 구현.
4.  **UI Refinement:** 로딩 화면(Lottie), 버튼 클릭 효과 등 마이크로 인터랙션 추가.
5.  **PWA Optimization:** 아이콘 추가, 스플래시 스크린 설정.

---

## 4. 디자인 & 반응형 전략 (Mobile First)

### 4.1 모바일 최적화 전략
웹 앱이 진짜 앱처럼 느껴지게 하기 위한 필수 요소입니다.

* **Safe Area:** 아이폰 노치와 하단 바 영역 침범 방지.
    ```css
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    ```
* **Touch Action:** 모바일에서 더블 탭 확대 방지.
    ```css
    touch-action: manipulation;
    ```
* **Dynamic Height:** 브라우저 주소창 변화에 대응.
    `100vh` 대신 **`100dvh`** 사용 필수.

### 4.2 애니메이션 가이드
* **Page Transition:** 페이지 이동 시 좌우로 슬라이드되거나 부드럽게 페이드인/아웃.
* **Loading:** 이미지 생성 중(10초) 이탈을 막기 위해, "꿈의 조각을 모으는 중..." 같은 문구와 함께 몽환적인 파티클 애니메이션 노출.

---

## 5. 배포 및 점검 (Deployment)

### 5.1 배포 전 체크리스트
1.  **모바일 테스트:** 크롬 개발자 도구(Device Mode)가 아니라, **실제 핸드폰**으로 접속했을 때 주소창 UI가 거슬리지 않는지 확인.
2.  **PWA 설치:** "홈 화면에 추가" 했을 때 아이콘과 앱 이름(Dreamary)이 정확히 뜨는지.
3.  **API 보안:** OpenAI API Key가 클라이언트(브라우저)에 노출되지 않고 서버 사이드에서 호출되는지 확인.

### 5.2 배포 프롬프트 (Vercel)
> "Vercel에 배포하기 위해 최적화를 진행할 거야.
> 1. `next.config.js`에 PWA 관련 설정(next-pwa)이 올바르게 되었는지 확인해줘.
> 2. 모바일에서 터치 반응 속도를 높이기 위한 CSS 팁이 있다면 적용해줘."

---

## 🚀 바로 시작하기 (Action Item)

안티그래비티 채팅창에 아래 명령어를 입력하여 프로젝트를 시작하세요.

> **"Dreamary 프로젝트를 시작한다. 위 가이드의 [2.1 초기 셋팅 프롬프트]를 바탕으로, 모바일 퍼스트 PWA 구조의 Next.js 프로젝트 보일러플레이트 코드를 작성해줘."**