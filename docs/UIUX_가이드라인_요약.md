# UI/UX 디자인 가이드라인 요약

## 1. 디자인 철학

LUMI+ 플랫폼은 뷰티 디바이스와 AI 기술을 결합하여 사용자에게 전문적이고 신뢰할 수 있는 피부 케어 솔루션을 제공합니다.

### 핵심 원칙
- **전문성 (Professionalism)**: 의료 기기급 품질과 신뢰감을 전달하는 깔끔하고 정돈된 인터페이스
- **직관성 (Intuitiveness)**: 복잡한 기술을 단순하고 이해하기 쉽게 전달
- **글로벌 접근성 (Global Accessibility)**: 다양한 언어와 문화권의 사용자를 고려한 유니버설 디자인

### 브랜드 아이덴티티
- **브랜드 키워드**: 전문성, 혁신, 신뢰, 글로벌, 맞춤형
- **비주얼 톤**: 모던하고 깔끔한 미니멀 디자인, 부드러운 그라데이션, 전문적인 타이포그래피
- **감성**: 안정감, 신뢰감, 프리미엄, 따뜻함

## 2. 디자인 시스템

### 컬러 시스템

#### Primary Colors
| 컬러명 | HEX | 용도 |
|--------|-----|------|
| LUMI Blue | #3B82F6 | 주요 버튼, CTA, 링크 |
| LUMI Light Blue | #60A5FA | Hover 상태, 보조 강조 |
| LUMI Dark Blue | #1E40AF | Active 상태, 헤더 |

#### Secondary Colors
| 컬러명 | HEX | 용도 |
|--------|-----|------|
| Rose Gold | #F59E0B | 프리미엄 강조, 배지 |
| Soft Purple | #A78BFA | AI 진단 관련 요소 |

#### Neutral Colors
| 컬러명 | HEX | 용도 |
|--------|-----|------|
| Text Primary | #1F2937 | 본문 텍스트 |
| Text Secondary | #6B7280 | 보조 텍스트 |
| Background | #F9FAFB | 배경색 |
| Border | #E5E7EB | 테두리, 구분선 |

#### Semantic Colors
| 상태 | HEX | 용도 |
|------|-----|------|
| Success | #10B981 | 성공 메시지 |
| Warning | #F59E0B | 경고 메시지 |
| Error | #EF4444 | 오류 메시지 |
| Info | #3B82F6 | 정보 메시지 |

### 타이포그래피

#### 폰트 패밀리
- 한글: Noto Sans KR (sans-serif)
- 영문/숫자: Inter, Roboto (sans-serif)
- 일본어: Noto Sans JP

#### 폰트 크기 스케일
| 레벨 | 크기 | 행간 | 용도 |
|------|------|------|------|
| H1 | 32px | 40px | 페이지 제목 |
| H2 | 24px | 32px | 섹션 제목 |
| H3 | 20px | 28px | 카드 제목 |
| Body | 16px | 24px | 본문 |
| Small | 14px | 20px | 보조 텍스트 |
| Caption | 12px | 16px | 캡션, 라벨 |

### 아이콘 & 이미지

#### 아이콘 시스템
- 스타일: Outline 스타일 (선 굵기 1.5px)
- 크기: 16px, 20px, 24px
- 컬러: 기본 #6B7280, 활성 #3B82F6
- 라이브러리: Heroicons, Phosphor Icons

#### 이미지 가이드
- 스타일: 깨끗하고 고품질의 제품/피부 이미지
- 비율: 16:9 (히어로 배너), 1:1 (제품 이미지), 4:3 (진단 결과)
- 코너 라디우스: 8px (일반), 16px (큰 카드)
- 최적화: WebP 포맷, 반응형 크기별 제공

### 그리드 & 레이아웃

#### 그리드 시스템
- **Desktop (1024px~)**: 12 컬럼 그리드, Max-width 1280px
- **Tablet (768~1023px)**: 8 컬럼 그리드
- **Mobile (320~767px)**: 4 컬럼 그리드

#### 여백 시스템 (8px 기반)
| 크기 | 값 | 용도 |
|------|-----|------|
| XXS | 4px | 최소 간격 |
| XS | 8px | 컴포넌트 내부 |
| SM | 16px | 컴포넌트 사이 |
| MD | 24px | 섹션 내부 |
| LG | 32px | 섹션 사이 |
| XL | 48px | 큰 섹션 사이 |

## 3. 컴포넌트 라이브러리

### 버튼

#### 버튼 종류
| 타입 | 스타일 | 용도 |
|------|--------|------|
| Primary | 배경 #3B82F6, 텍스트 White | 주요 액션 |
| Secondary | 배경 투명, 테두리 #3B82F6 | 보조 액션 |
| Text | 배경 없음, 텍스트 #3B82F6 | 링크형 액션 |
| Danger | 배경 #EF4444, 텍스트 White | 삭제, 위험 액션 |

#### 버튼 크기
- **Large**: 높이 48px, 패딩 16px 24px, 폰트 16px
- **Medium**: 높이 40px, 패딩 12px 20px, 폰트 14px
- **Small**: 높이 32px, 패딩 8px 16px, 폰트 14px

### 폼 요소

#### Input Field
- 높이: 48px (기본)
- 패딩: 12px 16px
- 테두리: 1px solid #E5E7EB
- 라디우스: 8px
- Focus: 테두리 #3B82F6, 아웃라인 2px #3B82F6 20% 투명
- Error: 테두리 #EF4444, 하단 에러 메시지 표시

#### Checkbox / Radio
- 크기: 20px × 20px
- 체크 컬러: #3B82F6
- 라벨 간격: 8px

### 카드
- 배경: White
- 테두리: 1px solid #E5E7EB
- 라디우스: 12px
- 패딩: 24px
- 그림자: 0 1px 3px rgba(0,0,0,0.1)
- Hover: 그림자 0 4px 12px rgba(0,0,0,0.1)

### 모달
- 배경 오버레이: rgba(0,0,0,0.5)
- 모달 창: 배경 White, 라디우스 16px, 최대 너비 600px
- 패딩: 32px
- 닫기 버튼: 우측 상단 24px 아이콘
- 애니메이션: Fade-in 0.2s, Scale 0.95→1

### 네비게이션

#### 헤더 네비게이션
- 높이: 64px (Desktop), 56px (Mobile)
- 배경: White, 하단 1px 보더 #E5E7EB
- 로고: 좌측 정렬, 높이 32px
- 메뉴 아이템: 폰트 16px, 간격 24px
- 활성 상태: 텍스트 #3B82F6, 하단 2px 보더

#### 사이드바 네비게이션
- 너비: 280px (Desktop)
- 배경: #F9FAFB
- 메뉴 아이템: 높이 44px, 패딩 12px 16px, 라디우스 8px
- 활성/Hover: 배경 White, 텍스트 #3B82F6

## 4. 주요 화면 설계

### 회원가입/로그인
- 센터 정렬 카드 형식 (최대 너비 400px)
- 좌측: 브랜드 이미지 (Desktop만), 우측: 폼
- 소셜 로그인 버튼 (Google, Apple, Kakao)

### 디바이스 등록
- 단계별 진행 표시 (Step Indicator)
- 중앙 정렬 폼 (최대 너비 600px)
- 이전/다음 버튼 하단 고정

### AI 피부 진단
- 좌측: 카메라 프리뷰 (50%), 우측: 가이드 및 정보 (50%)
- Mobile: 상단 카메라, 하단 가이드
- 진단 중: 로딩 애니메이션 + 진행 상태

### 진단 결과 리포트
- 상단: 종합 점수 + 주요 문제 영역
- 중앙: 세부 분석 카드 (피부 타입, 수분, 탄력, 잡티, 주름 등)
- 하단: 맞춤 케어 추천 + 구독 서비스 CTA

### 구독 서비스
- 상단: 구독 플랜 비교 테이블 (3단계)
- 중앙: 맞춤 제품 미리보기
- 하단: 결제 정보 입력

## 5. 반응형 디자인

### 브레이크포인트
| 디바이스 | 범위 | 주요 조정 사항 |
|----------|------|----------------|
| Mobile | 320~767px | 단일 컬럼, 햄버거 메뉴, 터치 최적화 |
| Tablet | 768~1023px | 2컬럼 레이아웃, 사이드바 축소 |
| Desktop | 1024px~ | 다중 컬럼, 전체 메뉴, 호버 인터랙션 |

### Mobile (320~767px)
- 네비게이션: 햄버거 메뉴, 하단 고정 탭바
- 레이아웃: 단일 컬럼, 스택 방식
- 폰트 크기: H1 24px, Body 14px
- 버튼: Full-width 또는 최소 48px 높이
- 터치 타겟: 최소 44×44px

### Tablet (768~1023px)
- 네비게이션: 축소된 사이드바 또는 상단 메뉴
- 레이아웃: 2 컬럼 그리드
- 폰트 크기: Desktop과 유사, 약간 축소

### Desktop (1024px~)
- 네비게이션: 전체 메뉴 표시
- 레이아웃: 3~4 컬럼 그리드, 사이드바 + 메인
- 호버 효과: 활성화

## 6. 접근성 가이드

### 색상 대비
- 본문 텍스트: 최소 4.5:1 대비율
- 대형 텍스트 (18px+): 최소 3:1 대비율
- 상호작용 요소: 3:1 대비율

### 키보드 네비게이션
- 모든 인터랙티브 요소는 키보드로 접근 가능
- Tab 키로 순차적 이동 (논리적 순서)
- Focus 상태 명확히 표시 (2px outline #3B82F6)
- Enter/Space로 버튼 활성화
- Esc 키로 모달/드롭다운 닫기

### 스크린 리더 대응
- 시맨틱 HTML: `<header>`, `<nav>`, `<main>`, `<footer>` 사용
- ARIA 속성: role, aria-label, aria-describedby
- 대체 텍스트: 모든 이미지에 alt 속성
- 폼 레이블: 모든 입력 필드에 명확한 label

### 터치/모바일 접근성
- 터치 타겟: 최소 44×44px (iOS), 48×48px (Android)
- 간격: 터치 요소 사이 최소 8px
- 제스처: 스와이프 등 대체 방법 제공
- 방향: 가로/세로 모드 모두 지원

## 7. 다국어 UI 고려사항

### 텍스트 확장 대응
- 독일어, 러시아어: 영어 대비 30~40% 길이 증가
- 일본어, 중국어: 영어 대비 20~30% 길이 감소
- 한국어: 영어와 유사하거나 약간 긴 편

### 디자인 대응 방법
- 버튼: 최소 너비 설정 없이 padding으로 조정
- 레이블: 고정 너비 대신 flex 또는 grid 사용
- 줄바꿈: word-wrap: break-word 적용
- 테스트: 모든 언어에서 레이아웃 확인

### RTL 레이아웃 (아랍어 등)
- 텍스트 정렬: 우측 정렬
- 내비게이션: 좌우 반전 (햄버거 메뉴 우측)
- 아이콘: 방향성 아이콘 반전
- CSS: dir="rtl" 속성, logical properties 사용

### 언어별 폰트
| 언어 | 폰트 | 폴백 |
|------|------|------|
| 한국어 | Noto Sans KR | sans-serif |
| 영어 | Inter, Roboto | sans-serif |
| 일본어 | Noto Sans JP | sans-serif |
| 중국어 | Noto Sans SC/TC | sans-serif |
| 아랍어 | Noto Sans Arabic | sans-serif |

## 참고 자료

- WCAG 2.1 가이드라인: https://www.w3.org/WAI/WCAG21/quickref/
- Material Design: https://material.io/design
- Apple Human Interface Guidelines: https://developer.apple.com/design/
- Nielsen Norman Group: https://www.nngroup.com/
