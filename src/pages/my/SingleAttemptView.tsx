import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { PRINCIPLES } from '@/data/principles';
import { useLiveMentorProgress } from '@/features/mentor/useLiveMentorProgress';
import { isAllDone, totalDurationMs } from '@/features/mentor/simulator';
import { buildReportData } from '@/features/report/buildReportData';
import { buildReportHtml, reportFileName } from '@/features/report/buildHtml';
import { computeFinalScore } from '@/features/report/scoring';
import { downloadHtmlFile } from '@/lib/download';
import { formatRemaining } from '@/lib/format';
import type { AiAnalysis, Attempt } from '@/types';
import styles from './SingleAttemptView.module.css';

type StageStatus = 'done' | 'active' | 'ready' | 'locked';

const STEPPER = [
  { label: 'AI 분석' },
  { label: '멘토 검증' },
  { label: '리포트' },
];

function step1Status(attempt: Attempt): StageStatus {
  return attempt.ai ? 'done' : 'active';
}
function step2Status(attempt: Attempt): StageStatus {
  if (!attempt.ai) return 'locked';
  if (attempt.mentorFeedback) return 'done';
  if (attempt.mentorRequest) return 'active';
  return 'ready';
}
function step3Status(attempt: Attempt): StageStatus {
  if (!attempt.mentorFeedback) return 'locked';
  return attempt.finalReview ? 'done' : 'active';
}

function toneOf(score: number): 'primary' | 'soft' | 'mute' {
  if (score >= 8) return 'primary';
  if (score >= 5) return 'soft';
  return 'mute';
}

function topBottom(ai: AiAnalysis) {
  const named = ai.principles.map((s) => ({
    ...s,
    nameKr: PRINCIPLES.find((p) => p.id === s.id)?.nameKr ?? s.id,
  }));
  const sorted = [...named].sort((a, b) => b.score - a.score);
  return { top: sorted.slice(0, 3), bottom: sorted.slice(-3).reverse() };
}

type SingleAttemptViewProps = {
  attempt: Attempt;
  /** 이 회차가 attempts[0](최신)인지 — 위저드 라우트(/portfolio/*)는 항상 최신 회차만 보여준다. */
  isActive: boolean;
};

/** 1·2·3단계를 한 화면에 보여주는 뷰 — 0회 총 회차일 때(09 §4)와 카드 그리드 클릭 시(09 §5) 공유한다. */
export function SingleAttemptView({ attempt, isActive }: SingleAttemptViewProps) {
  const s1 = step1Status(attempt);
  const s2 = step2Status(attempt);
  const s3 = step3Status(attempt);
  const statuses: StageStatus[] = [s1, s2, s3];

  return (
    <div className={styles.view}>
      <ol className={styles.stepper}>
        {STEPPER.map((step, i) => (
          <li key={step.label} className={styles.stepperItem} data-status={statuses[i]}>
            <span className={styles.stepperIcon} aria-hidden="true">
              {statuses[i] === 'done' ? '✓' : statuses[i] === 'active' ? '●' : '○'}
            </span>
            <span>
              ({i + 1}) {step.label}
            </span>
            <span className={styles.stepperState}>
              {statuses[i] === 'done' ? '완료' : statuses[i] === 'active' ? '진행중' : '대기'}
            </span>
          </li>
        ))}
      </ol>

      <div className="card-grid">
        <AiCard attempt={attempt} status={s1} isActive={isActive} />
        <MentorCard attempt={attempt} status={s2} isActive={isActive} />
        <ReportCard attempt={attempt} status={s3} isActive={isActive} />
      </div>
    </div>
  );
}

function AiCard({ attempt, status, isActive }: { attempt: Attempt; status: StageStatus; isActive: boolean }) {
  const navigate = useNavigate();

  return (
    <Card className={styles.card}>
      <p className={styles.cardTitle}>① AI 분석</p>
      {status === 'active' && <p className="meta">분석이 진행되고 있습니다.</p>}
      {status === 'done' && attempt.ai && (
        <>
          <p className={styles.cardScore}>
            {attempt.ai.totalScore}
            <span className={styles.cardScoreMax}> / 100</span>
            <span className={styles.cardGrade}>Grade {attempt.ai.grade}</span>
          </p>
          <div className={styles.miniBars} aria-hidden="true">
            {attempt.ai.principles.map((p) => (
              <span key={p.id} className={styles.miniBar} data-tone={toneOf(p.score)} style={{ height: `${8 + p.score * 2.4}px` }} />
            ))}
          </div>
          {(() => {
            const { top, bottom } = topBottom(attempt.ai);
            return (
              <div className={styles.topBottom}>
                <p className="meta">상위 3 · {top.map((p) => p.nameKr).join(', ')}</p>
                <p className="meta">하위 3 · {bottom.map((p) => p.nameKr).join(', ')}</p>
              </div>
            );
          })()}
          {isActive && (
            <Button variant="ghost" className={styles.cardAction} onClick={() => navigate('/portfolio/analyze')}>
              1단계 자세히 →
            </Button>
          )}
        </>
      )}
    </Card>
  );
}

function MentorCard({ attempt, status, isActive }: { attempt: Attempt; status: StageStatus; isActive: boolean }) {
  const navigate = useNavigate();
  const { stages, now } = useLiveMentorProgress(attempt);
  const reviewStages = stages.filter((s) => s.id !== 'complete');
  const doneCount = reviewStages.filter((s) => s.status === 'done').length;
  const activeStage = reviewStages.find((s) => s.status === 'active');

  return (
    <Card className={styles.card}>
      <p className={styles.cardTitle}>② 멘토 검증</p>
      {status === 'locked' && <p className="meta">AI 분석 완료 후 열립니다.</p>}
      {status === 'ready' &&
        (isActive ? (
          <>
            <p className="meta">AI 분석이 끝났습니다. 멘토 검증을 요청해보세요.</p>
            <Button variant="ghost" className={styles.cardAction} onClick={() => navigate('/portfolio/mentor')}>
              멘토 검증 요청하기 →
            </Button>
          </>
        ) : (
          <p className="meta">이 회차는 최신 회차가 아니어서 멘토 검증을 요청할 수 없습니다.</p>
        ))}
      {status === 'active' && attempt.mentorRequest && (
        <>
          <p className="meta">
            {doneCount} / {reviewStages.length} 단계 진행 중
          </p>
          {activeStage && <p className={styles.cardScore}>현재 · {activeStage.label}</p>}
          {!isAllDone(stages) && (
            <p className="meta">
              예상 완료 {formatRemaining(new Date(attempt.mentorRequest.submittedAt).getTime() + totalDurationMs() - now)}
            </p>
          )}
          {isActive && (
            <Button variant="ghost" className={styles.cardAction} onClick={() => navigate('/portfolio/mentor')}>
              모니터 보기 →
            </Button>
          )}
        </>
      )}
      {status === 'done' && attempt.mentorFeedback && (
        <p className={styles.cardScore}>
          {attempt.mentorFeedback.mentorScore}
          <span className={styles.cardScoreMax}> / 100</span>
        </p>
      )}
    </Card>
  );
}

function ReportCard({ attempt, status, isActive }: { attempt: Attempt; status: StageStatus; isActive: boolean }) {
  const navigate = useNavigate();

  function handleDownload() {
    const report = buildReportData(attempt);
    if (!report) return;
    downloadHtmlFile(buildReportHtml(report), reportFileName(report.name));
  }

  return (
    <Card className={styles.card}>
      <p className={styles.cardTitle}>③ 통합 리포트</p>
      {status === 'locked' && <p className="meta">멘토 검증 완료 후 열립니다.</p>}
      {(status === 'active' || status === 'done') && attempt.ai && attempt.mentorFeedback && (
        <>
          <p className={styles.cardScore}>
            {computeFinalScore(attempt.ai.totalScore, attempt.mentorFeedback.mentorScore)}
            <span className={styles.cardScoreMax}> / 100</span>
          </p>
          {status === 'active' && <p className="meta">리포트를 확인하고 최종 제출해주세요.</p>}
          {isActive ? (
            <Button variant="ghost" className={styles.cardAction} onClick={() => navigate('/portfolio/report')}>
              리포트 보기 →
            </Button>
          ) : (
            <Button variant="ghost" className={styles.cardAction} onClick={handleDownload}>
              리포트 다운로드
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
