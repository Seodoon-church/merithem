# LUMI+ Platform

Merithem Inc.의 LUMI+ 뷰티 디바이스 종합 관리 플랫폼

## 프로젝트 개요

LUMI+ 플랫폼은 뷰티 디바이스와 AI 기술을 결합하여 사용자에게 전문적인 피부 진단과 맞춤형 케어 솔루션을 제공하는 통합 플랫폼입니다.

### 주요 기능

- **디바이스 등록 및 관리**: LUMI+ 디바이스를 플랫폼에 등록하고 관리
- **AI 피부 진단**: 딥러닝 기반 피부 분석 및 맞춤 케어 추천
- **구독 서비스**: AI 추천 제품의 정기 배송 서비스
- **다국어 지원**: 한국어, 영어, 일본어 지원으로 글로벌 서비스

## 기술 스택

### Frontend
- React 18.2 + TypeScript 5.0
- TailwindCSS 3.3
- React Query, Zustand
- i18next (다국어)

### Backend
- Node.js 20 LTS + Express 4.18
- Spring Boot 3.x + Java 21 (대안)
- TypeScript 5.0
- PostgreSQL 15, Redis 7.0, MongoDB 6.x

### AI Service
- Python FastAPI
- TensorFlow 2.15
- CNN 기반 피부 분석 모델

### Infrastructure
- AWS (EC2, RDS, S3, CloudFront, Route53)
- Docker + Kubernetes (EKS 1.28)
- CI/CD: GitHub Actions, ArgoCD

### External Integration
- 결제: 토스페이먼츠, 나이스페이
- 택배: 스윗트래커, 택배 API
- 소셜 로그인: 카카오, 네이버, 구글

## 개발 로드맵

### Phase 1: 기본 플랫폼 (3개월)
- 회원 가입/로그인
- 디바이스 등록 및 관리
- 마이페이지 기본 기능

### Phase 2: AI 진단 시스템 (4개월)
- AI 피부 진단 모델 개발
- 진단 결과 리포트
- 맞춤 케어 추천

### Phase 3: 구독 서비스 (3개월)
- 구독 플랜 관리
- 결제 시스템 연동
- AI 기반 제품 추천

### Phase 4: 글로벌 확장 (2개월)
- 다국어 지원 (한/영/일)
- 성능 최적화
- SEO 최적화

## 프로젝트 구조

```
merithem/
├── frontend/           # React 프론트엔드
├── backend/            # Node.js/Spring Boot 백엔드
├── ai-service/         # AI 진단 서비스
├── docs/               # 프로젝트 문서
└── infrastructure/     # 인프라 설정 (Docker, K8s)
```

## 시작하기

(추후 각 서비스별 실행 방법 추가 예정)

## 문서

- [개발 지시서 요약](./docs/개발_지시서_요약.md)
- [기술 명세서 요약](./docs/기술_명세서_요약.md)
- [UI/UX 가이드라인 요약](./docs/UIUX_가이드라인_요약.md)
- [개발 로드맵](./docs/개발_로드맵_요약.md)

## 라이선스

Copyright © 2025 Merithem Inc. All rights reserved.
