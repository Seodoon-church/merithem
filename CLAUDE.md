# LUMI+ Platform — Merithem 뷰티 디바이스 통합 플랫폼

> 이 문서는 프로젝트 특화 규칙을 담습니다. 공통 규칙은 `~/.claude/CLAUDE.md`에 있습니다.

## 1. 프로젝트 개요

**LUMI+ Platform**은 Merithem Inc. 의 뷰티 디바이스(LUMI+)와 AI 피부 진단을 결합한 **3-서비스 마이크로서비스 웹 플랫폼**입니다. 사용자는 LUMI+ 디바이스를 등록하고, AI 기반 피부 진단을 받고, 맞춤 화장품을 구독/구매할 수 있습니다.

- **상태**: 활발한 개발 중 (Phase 7 주문 관리 완료, 이후 브랜드 리디자인)
- **GitHub**: `Seodoon-church/merithem` (remote 연결됨)
- **기본 브랜치**: `main`
- **배포 URL**: {{TODO: 운영 도메인 확인}}
- **라이선스**: UNLICENSED (Copyright 2025 Merithem Inc.)

### 주요 기능
- **디바이스 관리** — LUMI+ 시리얼 등록, 펌웨어 버전, 보증 관리
- **AI 피부 진단** — 이미지 업로드 → FastAPI AI → 7개 지표(수분/탄력/주름/모공/색소/홍조/여드름) + 맞춤 추천
- **구독 서비스** — 월/분기/연 단위 basic/premium/enterprise 플랜, 자동 갱신
- **쇼핑** — 제품 카탈로그, 장바구니, 체크아웃, 주문 추적
- **다국어** — 한국어/영어/일본어 (i18next + DB 레벨 다국어 컬럼)

### ⚠️ 팀 표준과의 차이 (중요)

| 영역 | 팀 표준 | LUMI+ 실제 |
|---|---|---|
| 프레임워크 | Next.js 14+ App Router | **Vite + React 18 + react-router-dom** |
| 백엔드 | Firebase (Auth/Firestore/Functions) | **Node.js/Express + PostgreSQL + Redis + MongoDB** |
| 테스트 | Vitest | Jest (backend), 프론트 없음 |
| 배포 리전 | asia-northeast3 (Firebase) | **AWS** (EC2/RDS/S3/EKS) |
| 인증 | Firebase Auth | **자체 JWT** (access 30m / refresh 14d) |
| 스타일/상태 | Tailwind / Zustand | Tailwind 3.3 / Zustand 4.4 (일치) |

→ 본 프로젝트는 **Firebase 생태계 밖**에 있는 팀 내 유일한 레포입니다. 이유: (1) 자체 DB 스키마 제어(뷰티 도메인 + 결제/구독), (2) TensorFlow 기반 AI 를 FastAPI 로 분리, (3) AWS EKS 기반 확장 계획.

## 2. 기술 스택

**Frontend (`frontend/`)** — Vite 5 + React 18.2 (SPA) + TypeScript 5.3 (`strict`, `@/* → ./src/*`) · `react-router-dom` 6 · `@tanstack/react-query` 5 · `axios` 1.6 · **Zustand 4.4** (`src/store/authStore.ts`) · Tailwind CSS 3.3 · **i18next 23 + react-i18next 13** (ko/en/ja `src/i18n.ts` 인라인) · 테스트 러너 {{TODO: 미설정 — 팀 표준 Vitest 추가 필요}}

**Backend (`backend/`)** — Node.js 20 LTS + Express 4.18 + TypeScript 5.3 (`ts-node-dev` 개발, `tsc` → `dist/`) · `pg` 8.11 · `redis` 4.6 · `jsonwebtoken` 9 + `bcryptjs` · `joi` 17 · `helmet` · `express-rate-limit` · `cors` · `multer` · `winston` · 테스트 **Jest 29** · ESLint + Prettier. README 는 "Spring Boot 3.x + Java 21 (대안)" 을 언급하지만 **실제는 Node/Express 만** 구현됨.

**AI Service (`ai-service/`)** — **FastAPI 0.109** + uvicorn · Pydantic 2.5 · **TensorFlow 2.15** · scikit-learn · OpenCV 4.9 · Pillow · NumPy. ⚠️ 현재는 **룰 기반 휴리스틱/랜덤**, 실제 ML 모델 미로딩 (§6.3).

**Infrastructure** — 로컬: Docker Compose 7 services (Postgres 15 + Redis 7 + MongoDB 6 + backend + frontend + ai-service + pgAdmin). 프로덕션 계획: AWS EC2/RDS/S3/CloudFront/Route53 + EKS 1.28 + ArgoCD (`infrastructure/` 는 현재 README 만). 외부 연동 계획: 토스페이먼츠/나이스페이, 스윗트래커, Kakao/Naver/Google (구현 미확인).

## 3. 빠른 시작

### Docker Compose 한 번에 (권장)
```bash
make up         # docker-compose up -d
# → Frontend:   http://localhost:3000
# → Backend:    http://localhost:5000   (API prefix: /api/v1)
# → AI Service: http://localhost:8001   (Swagger: /docs)
# → pgAdmin:    http://localhost:5050   (admin@merithem.com / admin123)
# → Postgres 5432 · Redis 6379 · MongoDB 27017

make down           # 전체 종료
make logs / logs-be / logs-fe / logs-db
make clean          # 볼륨까지 삭제
make db-migrate     # 001_initial_schema.sql 수동 적용
```

### 서비스별 로컬 개발
```bash
make install                           # frontend + backend 의존성 일괄 설치
cd frontend && npm run dev             # Vite dev, port 3000
cd backend && npm run dev              # ts-node-dev, port 5000
cd ai-service && pip install -r requirements.txt && python -m app.main   # port 8001
```

**사전 요구사항**: Docker Desktop, Node.js 20 LTS, Python 3.10+, make (Windows 는 WSL 권장)

## 4. 디렉토리 구조

```
merithem/
├── frontend/                      # React SPA (Vite)
│   ├── src/
│   │   ├── main.tsx · App.tsx · i18n.ts · index.css
│   │   ├── pages/
│   │   │   ├── HomePage.tsx · auth/{LoginPage,RegisterPage}.tsx
│   │   │   ├── DashboardPage · DevicesPage · ProfilePage
│   │   │   ├── DiagnosesPage · DiagnosisDetailPage · SkinAnalysisPage  (AI 업로드)
│   │   │   ├── SubscriptionPlansPage · SubscriptionPage
│   │   │   ├── ProductsPage · ProductDetailPage
│   │   │   └── CartPage · CheckoutPage · OrdersPage · OrderDetailPage
│   │   ├── components/            # Layout, ProtectedRoute, LanguageSwitcher
│   │   ├── services/              # axios 도메인별 클라이언트 (api.ts + 10개)
│   │   ├── store/authStore.ts     # Zustand JWT 상태
│   │   └── types/
│   ├── vite.config.ts             # port 3000, /api → localhost:5000 프록시
│   └── tailwind.config.js · tsconfig.json
│
├── backend/                       # Node.js + Express API
│   └── src/
│       ├── server.ts              # Express bootstrap, /health, 10개 라우트 마운트
│       ├── config/{database,redis}.ts
│       ├── middleware/
│       │   ├── auth.ts            # authMiddleware (JWT) + roleMiddleware
│       │   └── errorHandler.ts
│       ├── controllers/           # 10개: auth, user, device, dashboard,
│       │                          #   diagnosis, subscription, ai, product, cart, order
│       ├── routes/                # 10개 (controllers 1:1)
│       └── utils/                 # winston logger 등
│
├── ai-service/                    # Python FastAPI
│   └── app/
│       ├── main.py                # FastAPI bootstrap, /health, CORS=*
│       ├── routers/analysis.py    # POST /analysis/skin, /quick-scan, GET /test
│       ├── services/skin_analysis.py  # ⚠️ 현재 휴리스틱, TF 모델 미로딩
│       ├── models/                # 빈 디렉토리 (실제 .h5/.pb 배치 예정)
│       └── utils/                 # ImageProcessor
│
├── database/migrations/
│   ├── 001_initial_schema.sql     # users/user_profiles/devices/skin_diagnoses/
│   │                              #   subscriptions/products/orders/order_items/
│   │                              #   refresh_tokens/audit_logs (+ trigger/seed)
│   └── 002_update_orders_schema.sql   # orders JSONB → 개별 컬럼, cart_items 신규
│
├── infrastructure/                # ⚠️ README 만 있음 — IaC 미구현
├── docs/                          # 한글 기획 문서 4종 (개발 지시서/기술 명세서/UIUX/로드맵)
├── docker-compose.yml · Makefile · README.md · .gitignore
```

## 5. 환경 변수

### Backend (`backend/.env`)
```bash
NODE_ENV=development · PORT=5000 · API_PREFIX=/api/v1
DB_HOST/PORT/NAME/USER/PASSWORD (PostgreSQL lumiplus_db)
REDIS_HOST/PORT/PASSWORD
JWT_SECRET · JWT_ACCESS_EXPIRATION=30m · JWT_REFRESH_EXPIRATION=14d
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=10485760 (10MB) · UPLOAD_PATH=./uploads
AI_SERVICE_URL=http://localhost:8001 · LOG_LEVEL=debug
```

### AI Service (`ai-service/.env`)
```bash
PORT=8001 · ENVIRONMENT=development
MODEL_PATH=./models · ENABLE_GPU=false
MAX_IMAGE_SIZE=10485760 · ALLOWED_FORMATS=jpg,jpeg,png,webp
```

### Frontend
- `.env` 없음. `vite.config.ts` 의 `/api` → `localhost:5000` 프록시로 dev 동작
- Docker Compose 에서는 `VITE_API_URL=http://localhost:5000/api/v1` 주입

### ⚠️ docker-compose.yml 에 하드코딩된 시크릿
`POSTGRES_PASSWORD: postgres123`, `JWT_SECRET: lumiplus_dev_secret_key_2025`, `MONGO_INITDB_ROOT_PASSWORD: admin123`, `PGADMIN_DEFAULT_PASSWORD: admin123` — **git 에 그대로 커밋됨**. 프로덕션 전 AWS Secrets Manager 이관 필수. §9 참고.

## 6. 핵심 아키텍처

### 6.1 3-서비스 구성

```
Browser (React SPA :3000)
  │ axios → /api/v1/*   (Vite dev proxy)
  ▼
Backend API (Express :5000)
  ├─ PostgreSQL :5432   — 도메인 데이터 전체
  ├─ Redis :6379        — 세션/캐시 {{TODO: 실제 사용처 확인}}
  ├─ MongoDB :27017     — AI 원본 데이터 {{TODO: 실제 사용처 확인}}
  │ httpx / axios
  ▼
AI Service (FastAPI :8001)
  └─ skin_analysis_service → OpenCV/PIL 전처리 → (현재) 휴리스틱 점수
     (미래) TensorFlow 2.15 CNN 모델
```

### 6.2 인증 흐름 (JWT 이중 토큰)

1. `POST /api/v1/auth/login` → `bcryptjs` 로 `users.password_hash` 검증
2. access(30m) + refresh(14d) 발급, refresh 는 `refresh_tokens` 테이블에 저장
3. 클라이언트: 두 토큰을 **`localStorage`** 에 저장 (Zustand `authStore`)
4. axios interceptor (`src/services/api.ts`) 가 `Authorization: Bearer <access>` 자동 부착
5. 만료 시 refresh → 새 access, 실패 시 전역 logout (`authStore.checkAuth`)
6. 로그아웃 시 `refresh_tokens.revoked_at` 갱신 + 로컬스토리지 삭제

### 6.3 AI 진단 파이프라인

1. Frontend `SkinAnalysisPage` 에서 이미지 선택
2. Frontend → Backend `POST /api/v1/ai/*` (multer 업로드)
3. Backend → AI Service `POST /api/v1/analysis/{skin,quick-scan}` 릴레이
4. AI: Pillow/OpenCV 전처리(224x224) → `extract_skin_features` → `_calculate_skin_scores` (7 metrics) → `_generate_recommendations`
5. 결과 → Backend → PostgreSQL `skin_diagnoses` 저장 → 프론트 반환

> ⚠️ `skin_analysis.py` 는 **실제 ML 모델을 로딩하지 않고 룰 기반/일부 `random`** 으로 동작. 주석에 "In production, load actual ML models here". `ai-service/app/models/` 는 빈 상태. 실제 `.h5`/`.pb` 배치 + `__init__` 로딩 필요.

### 6.4 Backend API 라우트 (`API_PREFIX=/api/v1`)

| Prefix | 비고 |
|---|---|
| `/auth` | login/register/refresh/logout |
| `/users` · `/devices` · `/dashboard` · `/diagnoses` · `/subscriptions` | 도메인 CRUD |
| `/ai` | AI 서비스 릴레이 |
| `/products` · `/cart` · `/orders` | 이커머스 |

보안: `authMiddleware` (JWT 검증) + `roleMiddleware('admin', ...)` (역할 체크)

## 7. 도메인 모델 (PostgreSQL)

```
users                    id(UUID)·email(UNIQUE)·password_hash·role(user|admin|super_admin)
                         ·status·language(ko|en|ja)·timezone(default Asia/Seoul)·deleted_at
user_profiles            birth_date·gender·skin_type(dry|oily|combination|sensitive|normal)
                         ·skin_concerns[]·allergies[]·주소(city/state/postal_code/country='KR')
devices                  serial_number(UNIQUE)·model·firmware_version
                         ·status(active|inactive|maintenance|retired)·warranty_expires_at
skin_diagnoses           user_id·device_id·image_url·ai_model_version
                         ·overall + 6 metric scores(0-100): moisture/elasticity/wrinkle/
                          pore/pigmentation/redness/acne
                         ·skin_tone·detected_issues[]·recommendations(JSONB)
subscriptions            plan_type(basic|premium|enterprise)·billing_cycle(monthly|
                          quarterly|yearly)·status·price·currency='KRW'·auto_renewal
products                 sku(UNIQUE)·name/name_en/name_ja·description/*_en/*_ja
                         ·category·brand·price·stock_quantity·image_urls[]
                         ·ingredients[]·skin_types[]·concerns[]·deleted_at
orders                   order_number·status(pending→delivered/cancelled/refunded)
                         ·subtotal·tax·shipping_fee·total_amount(← 구 "total")
                         ·payment_status·shipping_address/city/state/postal/country
                         ·phone_number·tracking_number (migration 002 리팩토링됨)
order_items              order_id·product_id·quantity·price_at_time·total_price
cart_items               (UNIQUE user_id+product_id)·quantity  — migration 002 추가
refresh_tokens           user_id·token(UNIQUE 500)·expires_at·revoked_at
audit_logs               user_id·action·entity_type·entity_id·changes(JSONB)·ip_address
```

- **자동 트리거**: `update_updated_at_column()` — users, user_profiles, devices, subscriptions, products, orders, cart_items
- **초기 시드**: `admin@merithem.com` (role=super_admin) — ⚠️ `password_hash` 가 플레이스홀더 `$2a$10$YourHashedPasswordHere`
- **다국어 전략**: 제품은 DB `_en/_ja` 컬럼, UI 는 `src/i18n.ts` 인라인, 사용자 선호는 `users.language`

## 8. 자주 쓰는 명령

```bash
# ── 전체 (Makefile) ──
make help / up / down / restart / logs / logs-be / logs-fe / logs-db
make clean            # 컨테이너+볼륨 삭제 (데이터 날림)
make install          # frontend+backend npm install
make build            # docker-compose build
make test             # backend Jest + frontend(스크립트 없음)
make db-migrate       # 001 수동 적용
make db-reset         # ⚠️ DB 초기화 (확인 프롬프트)
make dev-fe / dev-be / prod-build

# ── Frontend ──
cd frontend
npm run dev · build · preview · lint

# ── Backend ──
cd backend
npm run dev · build · start · test · lint · format

# ── AI Service ──
cd ai-service
python -m app.main                   # uvicorn reload
# Swagger: http://localhost:8001/docs
```

## 9. 주의 사항

### ⚠️ 보안
- **docker-compose.yml 평문 시크릿 4종이 git 에 커밋됨** (`postgres123` / `lumiplus_dev_secret_key_2025` / `admin123` x2). 프로덕션 전 AWS Secrets Manager / SSM / Doppler 로 이관 필수
- **AI Service CORS `allow_origins=["*"]`** (`app/main.py`) — 프로덕션에서는 backend 도메인만 허용
- **admin seed password_hash 가 플레이스홀더** — 이 상태로 migration 실행 시 admin 로그인 불가. 배포 전 실제 bcrypt 로 교체 또는 seed 분리
- **refreshToken 을 localStorage 저장** — XSS 취약. 장기적으로 httpOnly 쿠키 + CSRF 토큰 이관 검토
- **로그인 에러 메시지 그대로 UI 노출** — `error.response?.data?.message` 를 검증 없이 사용 → 서버 오류 상세 누설 가능성

### ⚠️ 팀 표준과의 괴리
- 본 레포는 **Firebase 미사용**. `~/.claude/CLAUDE.md` 의 Firebase 가이드라인 거의 미적용. 배포 리전 `asia-northeast3` 가 아닌 **AWS**
- 프론트는 **Vite+SPA**(Next.js 아님) — App Router/RSC/Server Components 지식 적용 불가
- 테스트는 Jest(backend만). **팀 표준 Vitest 로 재정비 필요**

### ⚠️ AI 서비스
- 실제 ML 모델 **미로딩** 상태. 현재 점수는 휴리스틱/일부 `random`. Production 전 TF 모델 학습/배포 필수
- Backend→AI 연결: Compose 내부는 `http://ai-service:8001`, 개별 실행 시 `AI_SERVICE_URL` 수동 지정

### ⚠️ 데이터베이스
- 마이그레이션은 **수동 SQL 적용** (`psql < file`). 버전 관리 도구 없음 → `002` 는 `001` 적용 이후에만 안전. 장기적으로 `node-pg-migrate`/Prisma 도입 고려
- `make db-reset` 이 `merithem_postgres_data` 볼륨명을 하드코딩
- migration 002 에서 **`orders.total` → `total_amount`**, `order_items.unit_price` → `price_at_time` 리네이밍 — 구 컬럼 참조 코드가 남아있으면 깨짐, controllers 리뷰 필요

### ⚠️ 프론트엔드
- `vite.config.ts` `/api` 프록시는 **dev 전용**. 프로덕션 빌드 후 환경변수로 절대 URL 지정 필요
- i18n 리소스가 `src/i18n.ts` 한 파일에 ko/en/ja 모두 인라인 — 키 증가 시 분리 필요
- `App.tsx` 의 Layout 적용 패턴 {{TODO: 개별 페이지에서 import 하는지 확인}}

## 10. 개발 히스토리

commit 기반 Phase 진행 (최근 역순):

| Commit | 내용 |
|---|---|
| `46e3605` | 뷰티 디바이스 브랜드 리디자인 및 다국어 지원 확대 |
| `22cf697` | Fix: `middleware/auth.ts` 에 `export const auth = authMiddleware` alias 추가 |
| `39e5863` | enhance: HomePage 대폭 개선 |
| `f620d1d` | **Phase 7** — 주문 관리 (orders/order_items/cart_items, migration 002) |
| `9eff062` | **Phase 6** — 제품 카탈로그 및 쇼핑 (products, cart) |
| `a1d388c` | **Phase 5** — AI 피부 진단 (FastAPI ai-service, SkinAnalysisPage) |
| `511c4f5` | **Phase 4** — 구독 관리 (subscriptions, plans) |
| `02f0cca` | **Phase 3** — 대시보드 데이터 연동 + 피부 진단 관리 |
| `42a3636` | **Phase 2** — 사용자/디바이스 관리, 다국어 지원 |
| `4f96eac` | JWT 기반 인증 시스템 (authStore, 미들웨어, refresh_tokens) |
| `d94d19d` | DB 스키마(001) + Docker 인프라 |
| `a1dac19` | Node.js + Express + TypeScript 백엔드 초기 설정 |
| `271b419` | React 프론트엔드 초기 설정 |
| `26b5a03` | Initial commit |

### 진화 흐름
1. **Scaffolding**: Frontend → Backend → DB+Docker 순 레이어 구축
2. **Phase 1-2**: JWT 인증 → 사용자/디바이스 CRUD → 다국어
3. **Phase 3-5 (AI 코어)**: 대시보드 → 진단 기록 → 구독 → AI 서비스 분리
4. **Phase 6-7 (이커머스)**: 제품/장바구니/주문 (결제 게이트웨이는 아직 mock 추정)
5. **브랜드 단계**: 디바이스 브랜딩, HomePage 리디자인, 다국어 확대

## 11. TODO / 정리 필요한 항목

### 보안 (우선)
- [ ] docker-compose.yml 평문 시크릿 → 환경변수/Secrets Manager 이관
- [ ] `001_initial_schema.sql` admin seed password_hash 를 실제 bcrypt 로 교체
- [ ] AI Service CORS 를 backend 도메인만 허용하도록 좁히기
- [ ] refreshToken 저장 방식 재검토 (httpOnly 쿠키 + CSRF)

### 인프라/CI
- [ ] `infrastructure/` 에 실제 IaC(Terraform/CDK) 추가 — 현재 README 만
- [ ] AWS EKS 배포 파이프라인 (ArgoCD 매니페스트)
- [ ] GitHub Actions CI — backend/frontend lint, test, Docker 빌드
- [ ] 환경별 compose 분리 (`docker-compose.prod.yml`)

### AI / 코드 품질
- [ ] `ai-service/app/models/` 에 실제 TF 모델 배치 + 로딩, 휴리스틱 제거
- [ ] **Frontend 테스트 러너 도입 (팀 표준 Vitest + React Testing Library)**
- [ ] Backend Jest 실제 테스트 파일 작성 {{TODO: 현재 테스트 파일 존재 여부}}
- [ ] DB 마이그레이션 도구 도입 (`node-pg-migrate` 등) — 수동 SQL 탈피
- [ ] `services/` axios 중복 → React Query hooks 일원화

### 기능 / 검증
- [ ] 결제 게이트웨이 실제 연동 (토스페이먼츠/나이스페이) — 현재 mock 추정
- [ ] 소셜 로그인 (Kakao/Naver/Google) 실제 구현
- [ ] 택배 API (스윗트래커) tracking_number 활용
- [ ] Redis / MongoDB 실제 사용처 정의 {{TODO: 코드 사용 확인}}
- [ ] Layout/ProtectedRoute 적용 패턴, Spring Boot "대안" 유지 여부, 배포 도메인 확인

## 12. 참고

- **공통 규칙**: `~/.claude/CLAUDE.md` (Seodoon-church 전역)
- **하네스 표준**: `C:\Users\samsung\Documents\project\harness-standards\`
- **GitHub**: https://github.com/Seodoon-church/merithem
- **기획 문서**: `docs/개발_지시서_요약.md`, `docs/기술_명세서_요약.md`, `docs/UIUX_가이드라인_요약.md`, `docs/개발_로드맵_요약.md`
- **FastAPI Swagger** (로컬): http://localhost:8001/docs
- **pgAdmin** (로컬): http://localhost:5050
