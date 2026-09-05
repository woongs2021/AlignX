import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAppStore } from '@/store/useAppStore';
import { usePageMeta } from '@/layout/usePageMeta';
import type { Attempt } from '@/types';
import { AnalysisStartModal } from './AnalysisStartModal';
import type { Role } from './roles';
import styles from './PortfolioIntroPage.module.css';

const ROLE_EXAMPLES: { value: Role; label: string; examples: string; focus: string }[] = [
  {
    value: 'planning',
    label: '기획 · PM',
    examples: '서비스 기획안, PRD, 사용자 플로우 문서',
    focus: '문제 정의 · 근거, 구조적 정합성, 실행 가능성',
  },
  {
    value: 'marketing',
    label: '마케팅',
    examples: '캠페인 기획서, 콘텐츠 전략, 성과 리포트',
    focus: '정보 위계, 강조와 대비, 결과 · 임팩트 증명',
  },
  {
    value: 'design',
    label: '디자인',
    examples: 'UI/UX 포트폴리오, 브랜딩 · 그래픽 프로젝트',
    focus: '정보 위계, 일관성, 실행 가능성 · 사용성',
  },
  {
    value: 'dev',
    label: '개발 · 코드리뷰',
    examples: '개인 프로젝트, GitHub 저장소, PR 히스토리',
    focus: '구조적 정합성, 명료한 표현, 실행 가능성 · 사용성',
  },
  {
    value: 'other',
    label: '기타',
    examples: '위 네 가지에 속하지 않는 직무 결과물 전반',
    focus: '10대 원칙 전체 기준으로 채점',
  },
];

const STEPS = [
  {
    thumbKey: 'step1-loading',
    title: 'AlignX 1차 검증',
    duration: '약 90초',
    output: '10대 원칙 점수',
  },
  {
    thumbKey: 'step2-mentor',
    title: '멘토 2차 검증',
    duration: '1~2일',
    output: '멘토 피드백',
  },
  {
    thumbKey: 'step3-report',
    title: '통합 리포트',
    duration: '즉시',
    output: 'HTML 리포트',
  },
];

function resolveContinuePath(attempt: Attempt): string {
  if (attempt.ai == null) return '/portfolio/analyze';
  if (attempt.mentorFeedback == null) return '/portfolio/mentor';
  return '/portfolio/report';
}

export function PortfolioIntroPage() {
  usePageMeta({ title: '포트폴리오 분석 — AlignX', width: 'full' });
  const navigate = useNavigate();
  const location = useLocation();
  const activeAttempt = useAppStore((s) => s.attempts[0] ?? null);

  // "다시 분석하기"(1·3단계) · "새 분석 시작"(MY) 등 다른 화면에서 넘어올 때도 항상 이 팝업으로
  // 진입해 최초 분석과 동일한 UX를 쓰게 한다.
  const [isModalOpen, setIsModalOpen] = useState(
    () => (location.state as { openAnalysisModal?: boolean } | null)?.openAnalysisModal === true,
  );

  return (
    <div className={`container-narrow ${styles.page}`}>
      <div className={styles.header}>
        <span className="label">PORTFOLIO ANALYSIS</span>
        <h1 className={styles.title}>3단계로 검증하는 내 포트폴리오</h1>
        <p className={styles.lead}>
          AI가 10대 원칙으로 채점하고, 현직 멘토가 그 위에 사람의 판단을 얹습니다. 두 결과를 한 장의
          리포트로 받습니다.
        </p>
        <ul className={styles.highlights}>
          <li>기획 · 마케팅 · 디자인 · 개발 등 직군별로 최적화된 기준으로 AlignX가 1차 채점합니다.</li>
          <li>선택한 직무와 맞는 분야의 현직 전문 멘토가 2차로 직접 검토합니다.</li>
        </ul>
      </div>

      <div className={styles.steps}>
        {STEPS.map((step, i) => (
          <Card key={step.title} className={styles.stepCard}>
            <div className={styles.stepThumb}>
              <PlaceholderImage thumbKey={step.thumbKey} label={step.title} />
            </div>
            <div className={styles.stepMeta}>
              <span>0{i + 1}</span>
              <span>{step.duration}</span>
            </div>
            <p className={styles.stepTitle}>{step.title}</p>
            <p className="meta">산출물 — {step.output}</p>
          </Card>
        ))}
      </div>

      <div>
        <p className={styles.stepTitle}>직군별 예시</p>
        <div className={`card-grid ${styles.roleGrid}`}>
          {ROLE_EXAMPLES.map((item) => (
            <Card key={item.value} className={styles.roleCard}>
              <p className={styles.roleLabel} data-role={item.value}>
                {item.label}
              </p>
              <p className="meta">예시 — {item.examples}</p>
              <p className="meta">확인 포인트 — {item.focus}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card className={styles.requirements}>
        <p className={styles.stepTitle}>준비물</p>
        <ul className={styles.requirementsList}>
          <li>지원 포맷 — PDF, PNG, JPEG, GIF</li>
          <li>최대 용량 — 100MB</li>
          <li>권장 페이지 수 — 10~30페이지</li>
        </ul>
      </Card>

      <Card variant="soft" className={styles.ctaBand}>
        <div>
          <p className={styles.ctaTitle}>지금 바로 시작해보세요</p>
          <p className="meta">
            직군을 선택하면 그에 맞는 채점 기준과 전문 멘토가 배정됩니다. 정교하게 설계된 AlignX AI가 1차
            검수를 시작합니다. 포트폴리오에 따라 1분에서 최대 수 분까지 분석 시간이 걸릴 수 있습니다.
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            분석 시작하기
          </Button>
          {activeAttempt && (
            <Button variant="secondary" onClick={() => navigate(resolveContinuePath(activeAttempt))}>
              이어서 하기
            </Button>
          )}
        </div>
      </Card>

      <AnalysisStartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
