# LUMI+ Database Schema

PostgreSQL 기반 데이터베이스 스키마 및 마이그레이션 관리

## 📋 개요

이 디렉토리는 LUMI+ 플랫폼의 데이터베이스 스키마, 마이그레이션 파일, 시드 데이터를 포함합니다.

## 🗄️ 데이터베이스 구조

### 주요 테이블

#### 1. Users (사용자)
- 사용자 계정 및 인증 정보
- 이메일, 비밀번호, 역할, 상태 관리
- 다국어 설정 (한국어, 영어, 일본어)

#### 2. User Profiles (사용자 프로필)
- 확장된 사용자 정보
- 피부 타입, 피부 고민, 알레르기 정보
- 배송 주소 관리

#### 3. Devices (디바이스)
- LUMI+ 디바이스 등록 및 관리
- 시리얼 번호, 모델, 펌웨어 버전
- 디바이스 상태 및 동기화 정보

#### 4. Skin Diagnoses (피부 진단)
- AI 기반 피부 진단 결과
- 수분, 탄력, 주름, 모공, 색소침착 등 다양한 지표
- 추천 사항 및 이미지 저장

#### 5. Subscriptions (구독)
- 구독 플랜 관리 (Basic, Premium, Enterprise)
- 결제 주기 및 자동 갱신 설정
- 구독 상태 추적

#### 6. Products (제품)
- 화장품 제품 카탈로그
- 다국어 제품명 및 설명
- 재고, 가격, 이미지 관리

#### 7. Orders (주문)
- 주문 정보 및 상태 관리
- 결제 정보 및 배송 추적
- 주문 내역 관리

#### 8. Order Items (주문 상품)
- 주문별 상품 상세 정보
- 수량 및 가격 정보

#### 9. Refresh Tokens (리프레시 토큰)
- JWT 리프레시 토큰 관리
- 토큰 만료 및 폐기 추적

#### 10. Audit Logs (감사 로그)
- 시스템 작업 추적
- 사용자 활동 로깅
- 보안 및 컴플라이언스

## 🚀 마이그레이션 실행

### Docker를 사용한 PostgreSQL 실행

```bash
# PostgreSQL 컨테이너 실행
docker run --name lumiplus-postgres \
  -e POSTGRES_DB=lumiplus_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  -d postgres:15

# 마이그레이션 실행
psql -h localhost -U postgres -d lumiplus_db -f migrations/001_initial_schema.sql
```

### 로컬 PostgreSQL 사용

```bash
# 데이터베이스 생성
createdb -U postgres lumiplus_db

# 마이그레이션 실행
psql -U postgres -d lumiplus_db -f migrations/001_initial_schema.sql
```

## 📊 ERD (Entity Relationship Diagram)

```
Users ──┬── User Profiles (1:1)
        ├── Devices (1:N)
        ├── Skin Diagnoses (1:N)
        ├── Subscriptions (1:N)
        ├── Orders (1:N)
        └── Refresh Tokens (1:N)

Devices ─── Skin Diagnoses (1:N)

Orders ──── Order Items (1:N)

Products ── Order Items (N:M through Order Items)
```

## 🔒 보안 고려사항

- 비밀번호는 bcrypt로 해싱되어 저장
- JWT 토큰 기반 인증
- Refresh Token 관리로 보안 강화
- 감사 로그를 통한 모든 중요 작업 추적
- Row Level Security (RLS) 적용 가능

## 📝 인덱스 최적화

주요 쿼리 성능을 위한 인덱스:
- 사용자 이메일 조회
- 디바이스 시리얼 번호 조회
- 주문 번호 조회
- 진단 날짜 범위 조회
- 구독 만료일 조회

## 🔄 마이그레이션 버전 관리

- `001_initial_schema.sql`: 초기 스키마 (v1.0.0)
- 향후 마이그레이션 파일은 숫자 순서로 추가

## 🌐 다국어 지원

- 사용자 언어 설정: `ko` (한국어), `en` (영어), `ja` (일본어)
- 제품 정보 다국어 컬럼 제공
- 타임존 설정 지원

## 📈 확장성

- UUID 기반 Primary Key로 분산 시스템 지원
- JSONB 타입으로 유연한 데이터 구조
- Array 타입으로 다중 값 저장
- Soft Delete 지원 (deleted_at 컬럼)

## 🛠️ 유용한 쿼리

### 사용자 통계
```sql
SELECT role, COUNT(*) FROM users WHERE deleted_at IS NULL GROUP BY role;
```

### 활성 구독자 조회
```sql
SELECT u.email, s.plan_type, s.next_billing_date
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'active';
```

### 최근 진단 결과
```sql
SELECT u.name, sd.diagnosis_date, sd.overall_score
FROM skin_diagnoses sd
JOIN users u ON sd.user_id = u.id
ORDER BY sd.diagnosis_date DESC
LIMIT 10;
```

## 📞 문의

데이터베이스 관련 문의사항은 개발팀에 연락해주세요.
