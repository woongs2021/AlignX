import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '@/components/SectionHeader';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useAppStore } from '@/store/useAppStore';
import { usePageMeta } from '@/layout/usePageMeta';
import type { Attempt } from '@/types';
import styles from './PortfolioIntroPage.module.css';

const STEPS = [
  {
    thumbKey: 'step1-loading',
    title: 'AI 분석',
    duration: '약 90초',
    output: '10대 원칙 점수',
  },
  {
    thumbKey: 'step2-mentor',
    title: '멘토 검증',
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
  usePageMeta({ title: '포트폴리오 분석 — AlignX' });
  const navigate = useNavigate();
  const activeAttempt = useAppStore((s) => s.attempts[0] ?? null);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <SectionHeader eyebrow="PORTFOLIO ANALYSIS" title="3단계로 검증하는 내 포트폴리오" />
        <p className={styles.lead}>
          AI가 10대 원칙으로 채점하고, 현직 멘토가 그 위에 사람의 판단을 얹습니다. 두 결과를 한 장의
          리포트로 받습니다.
        </p>
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

      <Card className={styles.requirements}>
        <p className={styles.stepTitle}>준비물</p>
        <ul className={styles.requirementsList}>
          <li>지원 포맷 — PDF, PNG, JPEG, GIF</li>
          <li>최대 용량 — 50MB</li>
          <li>권장 페이지 수 — 10~30페이지</li>
        </ul>
      </Card>

      <div className={styles.notice}>
        <Badge variant="warning">주의</Badge>
        <p className="meta">분석 결과는 브라우저에만 저장됩니다. 기기를 바꾸면 사라집니다.</p>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => navigate('/portfolio/analyze')}>
          분석 시작하기
        </Button>
        {activeAttempt && (
          <Button variant="secondary" onClick={() => navigate(resolveContinuePath(activeAttempt))}>
            이어서 하기
          </Button>
        )}
      </div>
    </div>
  );
}
