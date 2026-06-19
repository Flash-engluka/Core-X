# Core X #1 — Undertale ver. 통합 프롬프트

> 이 문서는 HTML + JavaScript 기반 웹 게임 제작을 위한 완전한 개발 명세서입니다.
> Claude에게 그대로 붙여넣어 사용하세요.

---

## 🎮 [1] 프로젝트 개요

**게임 제목:** Core X #1 — Undertale ver.
**장르:** 4인 멀티플레이 유로 보드게임 (웹 구현)
**플랫폼:** 웹 브라우저 (PC · 모바일 반응형)
**기술 스택:** HTML5 · Vanilla JavaScript (ES2020+) · CSS3 · Firebase Realtime Database (온라인 멀티플레이)
**목표 플레이타임:** 1회 5~15분

**한 줄 소개:**
> "Frisk와 함께 Ruins, Snowdin, Waterfall, Hotland를 지나 Asriel을 구하는 4인 보드게임"

---

## 🌍 [2] 세계관 & 스토리

- 기반 세계관: UNDERTALE (Toby Fox) — 불살 루트(Pacifist Route)
- Frisk가 에봇 산에서 지하 세계로 떨어진 직후의 이야기
- 4개 구역(Ruins → Snowdin → Waterfall → Hotland)을 거쳐 최종적으로 Core에서 Asriel을 해방하는 사람이 승리
- 승리 조건: 최초로 **누적 100G 이상** 달성

---

## 👥 [3] 플레이어 & 캐릭터

### 플레이어 구성 (4인 고정)

| 플레이어 | 캐릭터 | 진영 (구역) | 진영 색상 |
|----------|--------|------------|----------|
| Player 1 | Toriel | Ruins | 주황 (#c87040) |
| Player 2 | Papyrus | Snowdin | 하늘 (#70b8e8) |
| Player 3 | Undyne | Waterfall | 파랑 (#4080c0) |
| Player 4 | Mettaton | Hotland | 붉은 (#e05020) |

### 캐릭터 업그레이드 경로

- **Undyne** → Pre-Undying → Undyne the Undying
- **Mettaton** → Mettaton EX → Mettaton NEO → Mettaton NEO + Alphys

> ※ 캐릭터 이미지는 추후 제공 예정. 현재는 임시 픽셀 아트(48×48px) 사용.

---

## 🗺 [4] 보드 맵 구조

### 구역 배치 (선형 구조 + 중앙 Core)

```
[Ruins] ─── [Snowdin] ─── [Waterfall] ─── [Hotland]
                              │
                           [Core]  ← 모든 구역에서 접근 가능
```

- 각 구역은 자신을 담당하는 캐릭터의 홈 진영
- **Core**: 중앙 특수 구역 — 업그레이드 전용 공간
- 플레이어는 한 턴에 인접 구역으로 1칸 이동하거나 Core로 바로 이동 가능

### 구역별 이동 가능 경로

| 현재 위치 | 이동 가능 위치 |
|----------|--------------|
| Ruins | Snowdin, Core |
| Snowdin | Ruins, Waterfall, Core |
| Waterfall | Snowdin, Hotland, Core |
| Hotland | Waterfall, Core |
| Core | 모든 구역 |

---

## 🔄 [5] 핵심 게임 루프 (Core Loop)

### 한 턴의 순서

```
① 이동 OR 줍기
      ↓
② (Core에 있다면) Core Upgrade 실행 가능
      ↓
③ (자신의 진영에 있다면) 소지품 교체 가능
      ↓
턴 종료 → 다음 플레이어
```

### 중요 규칙

- 한 턴에 최대 1회 업그레이드
- 소지품 교체는 자신의 진영에 도착한 **다음 턴부터** 가능
- 교체 개수에 상관없이 교체 행위 자체가 1턴 소모

---

## 📦 [6] 아이템 시스템

### 아이템 목록 (전체)

| 아이템 | 수량 | 비고 |
|-------|------|------|
| Froggit | 3개 | Core에서 Final Froggit으로 업그레이드 |
| Whimsun | 3개 | Core에서 Whimsalot으로 업그레이드 |
| Lesser Dog | 4개 | Core에서 Greater Dog으로 업그레이드 |
| Moldsmal | 3개 | Core에서 Moldbygg으로 업그레이드 (Undyne 관련) |
| Napstablook | 1개 | 공용 (Toriel, Waterfall 플레이어 필요) |
| Sans | 1개 | Snowdin 관련 |
| Flowey | 1개 | Snowdin 관련 |
| Asgore | 1개 | Waterfall 관련 |
| Monster Kid | 1개 | Hotland 관련 |
| 조커 | 별도 | 특수 카드 (1회용) |

### 업그레이드 규칙 (Core에서)

```
Froggit      → Final Froggit
Whimsun      → Whimsalot
Lesser Dog   → Greater Dog
Moldsmal     → Moldbygg  (Undyne의 To-do용)
```

### 소지품 한계

- 각 플레이어 최대 **8개** 소지품 보유 가능

---

## 💰 [7] 점수 (Gold, G) 시스템

### 기본 규칙

- 게임 시작 시 0G
- 매 라운드 시작마다 **+15G** 지급
- To-do 리스트 항목 1개 완료 시 **+5G**

### 캐릭터별 아이템 줍기 비용

#### Toriel (Ruins)
| 행동 | G 변화 |
|------|-------|
| Napstablook 줍기 | -10G |

#### Papyrus (Snowdin)
| 행동 | G 변화 |
|------|-------|
| Sans 줍기 | -5G |
| Flowey 줍기 | -7G |
| Sans + Flowey 둘 다 보유 시 최초 1회 | +2G 보너스 |

#### Undyne (Waterfall)
| 행동 | G 변화 |
|------|-------|
| Asgore 줍기 | -10G |

#### Mettaton (Hotland)
| 행동 | G 변화 |
|------|-------|
| Monster Kid 줍기 | -10G |

---

## ✅ [8] To-do 리스트 (구역별 목표)

> 각 구역 To-do를 완료하면 +5G. 전체 To-do 완료 후 100G 달성 시 최종 승리.

### Ruins (Toriel)

| 목표 | 조건 |
|------|------|
| Final Froggit 2마리 확보 | Froggit 2개 → Core 업그레이드 |
| Whimsalot 2마리 확보 | Whimsun 2개 → Core 업그레이드 |
| Napstablook 데려오기 | Ruins에서 -10G 지불 |

### Snowdin (Papyrus)

| 목표 | 조건 |
|------|-------|
| Greater Dog 3마리 확보 | Lesser Dog 3개 → Core 업그레이드 |
| Sans 데려오기 | Snowdin에서 -5G |
| Flowey 데려오기 | Snowdin에서 -7G |
| *(보너스)* Sans + Flowey 동시 보유 첫 순간 | +2G |

### Waterfall (Undyne)

| 목표 | 조건 |
|------|------|
| Moldbygg 2마리 확보 | Moldsmal 2개 → Core 업그레이드 |
| Undyne the Undying 2마리 확보 | Undyne 업그레이드 경로 완료 |
| Asgore 데려오기 | Waterfall에서 -10G |

### Hotland (Mettaton)

| 목표 | 조건 |
|------|------|
| Monster Kid 데려오기 | Hotland에서 -10G |
| Mettaton NEO + Alphys 달성 | 업그레이드 3단계 완료 |

---

## 🃏 [9] 조커 시스템

- 조커 카드 보유 시, 언제든 사용 가능 (1회용, 사용 후 소멸)
- 셋 중 하나 선택:

| 번호 | 효과 |
|------|------|
| ① | 즉시 Core로 이동 |
| ② | 다른 플레이어 아이템 1개 강탈 |
| ③ | 이번 턴 더블 턴 (한 번 더 행동) |

---

## 🖥 [10] 화면 구성 & UI 흐름

### 화면 전환 순서

```
타이틀 화면
    ↓
[온라인] 방 생성/참가 → 대기실 → 캐릭터(진영) 선택
[로컬]  캐릭터(진영) 선택
    ↓
인게임
    ↓
결과 화면 → 리더보드
```

### 인게임 HUD 레이아웃

```
┌──────────────┬──────────────────────────────┬────────────────┐
│ 소지품 리스트  │                              │ 진영 이름       │
│ (세로 8칸)    │       보드 (중앙 Canvas)       │ 플레이어 이름   │
│              │                              │                │
│              │                              │ To-do 리스트   │
│              │                              │                │
│              │                              │ 전체 점수      │
├──────────────┴──────────────────────────────┴────────────────┤
│  현재 차례 플레이어 | To-do 미니 요약 | 현재 G              │
└─────────────────────────────────────────────────────────────┘
```

### 팝업 / 모달 목록

| 팝업 | 트리거 |
|------|--------|
| 아이템 획득 | 아이템 줍기 성공 시 |
| 라운드 우승 | 구역 To-do 전체 완료 시 |
| 라운드 패배 | 다른 플레이어가 라운드 클리어 시 |
| 최종 승리 | 100G 달성 시 |
| 최종 패배 | 다른 플레이어가 100G 달성 시 |
| 최종 G 수 / 리더보드 | 게임 종료 후 결과 화면 |
| 조커 선택 | 조커 사용 버튼 클릭 시 |
| 업그레이드 선택 | Core에서 업그레이드 행동 시 |

---

## 🎨 [11] 비주얼 디자인

### 아트 스타일
- **픽셀 아트 (Pixel Art)** 전체 적용
- `image-rendering: pixelated` 강제 적용
- 가능한 모든 UI 요소에 픽셀 폰트 사용

### 컬러 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| 메인 (배경·포인트) | 딥 퍼플 | #7b52c1 |
| 서브 (강조) | 라이트 퍼플 | #a070e8 |
| 포인트 | 핑크 | #e87fd4 |
| 핑크 밝음 | 연핑크 | #ffb3f0 |
| 배경 다크 | 딥 다크 | #0d0010 |
| 골드 (G 표시) | 금색 | #f5c842 |
| Ruins | 주황 | #c87040 |
| Snowdin | 하늘 | #70b8e8 |
| Waterfall | 파랑 | #4080c0 |
| Hotland | 붉은 | #e05020 |
| Core | 실버 블루 | #c0c0ff |

### 배경 분위기
- 신비롭고 어두운 우주+지하 세계 분위기
- 별이 반짝이는 애니메이션 배경 (Canvas starfield)
- 구역별로 배경 컬러 톤 변화

### 폰트 규칙

| 용도 | 폰트 |
|------|------|
| 타이틀, 제목 | Press Start 2P (Google Fonts) — Papyrus 대체 픽셀 폰트 |
| 본문 · 알림 (영어) | Press Start 2P |
| 본문 · 알림 (한국어) | 굴림 (system-ui fallback) |
| 최종 리더보드 | 돋움 (system-ui fallback) |

### 캐릭터 스프라이트 (임시)
- 48×48px 픽셀 아트 Canvas 드로잉으로 임시 대체
- Toriel: 보라/분홍 계열
- Papyrus: 흰색/주황 계열
- Undyne: 파랑/청록 계열
- Mettaton: 핑크/회색 계열

### 애니메이션 목록

| 이벤트 | 애니메이션 |
|--------|----------|
| 최종 승리 | Asriel_b 이미지 출현 (scale + rotate 등장, 1초) |
| 캐릭터 대기 | float 애니메이션 (3초 루프) |
| 골드 획득 | 텍스트 팝업 (+NG) 위로 사라짐 |
| 타이틀 하트 | heartbeat 1.2초 루프 |
| 별 배경 | Canvas starfield 60fps |

> ※ 추가 애니메이션 필요 시 요청 예정

---

## 🔊 [12] 사운드

| 종류 | 곡/효과 |
|------|--------|
| BGM | Hopes and Dreams (Undertale OST) |
| 승리 SFX | Last Goodbye (Undertale OST) |
| 패배 SFX | Determination (Undertale OST) |
| 구현 방법 | Web Audio API 또는 Howler.js |

> ※ 저작권 이슈로 실제 OST 대신 유사 분위기의 8비트 Web Audio API 생성음 또는 로열티프리 트랙으로 대체 필요

---

## 🌐 [13] 온라인 멀티플레이 구조

### 기술 스택
- **Firebase Realtime Database** (서버리스, 실시간 동기화)
- 4인 실시간 접속 · 턴 동기화 · 게임 상태 공유

### 방 시스템
- 4자리 랜덤 코드로 방 생성
- 방장이 게임 시작 권한 보유
- 4명 모두 준비 완료 시 자동으로 캐릭터 선택 화면 전환

### 데이터 구조 (Firebase)

```json
{
  "rooms": {
    "{roomCode}": {
      "players": {
        "{uid}": {
          "name": "닉네임",
          "character": "Toriel",
          "gold": 0,
          "inventory": [],
          "position": "ruins",
          "ready": false,
          "upgraded": false
        }
      },
      "gameState": {
        "phase": "waiting | char-select | playing | ended",
        "currentTurn": 0,
        "round": 1,
        "items": {},
        "logs": []
      }
    }
  }
}
```

### 로컬 플레이 (오프라인)
- 동일 기기 · 동일 화면에서 4인 턴제 플레이
- localStorage로 게임 상태 저장
- 새로고침 시 복구 가능

---

## 🏗 [14] 개발 기술 스펙

### 파일 구조

```
corex/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js       ← 화면 전환, 초기화
│   ├── game.js       ← 게임 로직, 턴 관리
│   ├── board.js      ← 보드 렌더링 (Canvas 2D)
│   ├── sprites.js    ← 픽셀 아트 스프라이트 드로잉
│   └── online.js     ← Firebase 연동
└── assets/
    ├── sprites/      ← 캐릭터 이미지 (추후 교체)
    └── audio/        ← BGM, SFX
```

### 렌더링
- 보드 맵: HTML5 Canvas 2D API
- UI 패널: HTML + CSS (픽셀 스타일)
- 60fps requestAnimationFrame 루프

### 충돌/이벤트
- 보드 위 클릭: Canvas MouseEvent → 구역 판별
- 아이템 드래그: 마우스/터치 이벤트 지원

### 저장
- 로컬: localStorage
- 온라인: Firebase Realtime Database

### 반응형
- PC 기준 설계 후 모바일 터치 지원
- Canvas 동적 리사이징

---

## ✏️ [15] 미완성 / 추후 결정 항목

| 항목 | 현황 | 비고 |
|------|------|------|
| 캐릭터 이미지 | 미전달 | 추후 제공 예정, 현재 임시 픽셀 아트 |
| Asriel_b 이미지 | 미전달 | 승리 연출용, 추후 제공 |
| 보드 맵 이미지 | 미전달 | 제작자 직접 제공 예정 |
| Waterfall To-do | 부분 미완성 | 기획서 2페이지 참고하여 보완 필요 |
| Hotland To-do | 미완성 | 추후 기획 완성 후 반영 |
| 사운드 파일 | 미전달 | 저작권 검토 후 대체음 또는 원본 |

---

## 🚫 [16] 절대 포함 금지

- 광고 (어떤 형태든 금지)
- 외부 결제 시스템
- 폭력적 묘사

---

## 📋 [17] 개발 마일스톤

| 단계 | 내용 |
|------|------|
| MVP | 로컬 4인 플레이, 기본 턴 시스템, 보드 렌더링, 점수 표시 |
| Beta | 온라인 멀티플레이 (Firebase), 업그레이드 시스템, To-do 리스트, 모달 |
| Release | 캐릭터 이미지 교체, 사운드 적용, 애니메이션 완성, 모바일 최적화 |

---

*이 문서를 Claude에게 붙여넣으면 위 명세를 기반으로 게임 코드를 생성합니다.*
*이미지·사운드 파일은 별도로 전달하세요.*
