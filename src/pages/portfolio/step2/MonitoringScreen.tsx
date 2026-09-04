import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { useLiveMentorProgress } from '@/features/mentor/useLiveMentorProgress';
import { STAGE_CONFIG, isAllDone, isFastMode } from '@/features/mentor/simulator';
import { formatDateTime } from '@/lib/format';
import type { Attempt } from '@/types';
import styles from './MonitoringScreen.module.css';

type MonitoringScreenProps = {
  attempt: Attempt;
};

/** 실시간 검증 모니터 — 절대 시각 기반이라 탭을 닫았다 열어도 정확히 복원된다 (06 §3). */
export function MonitoringScreen({ attempt }: MonitoringScreenProps) {
  const navigate = useNavigate();
  const { stages } = useLiveMentorProgress(attempt);
  const [announcement, setAnnouncement] = useState('');
  const announcedRef = useRef(attempt.mentorFeedback != null);

  useEffect(() => {
    if ((attempt.mentorFeedback !== null || isAllDone(stages)) && !announcedRef.current) {
      announcedRef.current = true;
      setAnnouncement('멘토 검증이 완료되었습니다');
    }
  }, [stages, attempt.mentorFeedback]);

  const reviewStages = stages.filter((s) => s.id !== 'complete');
  const doneCount = reviewStages.filter((s) => s.status === 'done').length;
  // mentorFeedback이 있으면 무조건 완료다 — ADMIN/멘토가 실제로 확정 제출해야만 여기가 true가
  // 된다(Plans/14 §6.1) — 더 이상 타이머만으로는 완료되지 않는다.
  const done = attempt.mentorFeedback !== null || isAllDone(stages);
  const fast = isFastMode();
  const activeStage = reviewStages.find((s) => s.status === 'active');
  const waitingOnMentor = !done && activeStage?.id === 'mentor_review';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className="label">MENTOR VERIFICATION</span>
        <h1 className={styles.headline}>
          {attempt.mentorRequest?.name}님의 포트폴리오를 멘토들이 검증하고 있습니다
        </h1>
        {attempt.mentorRequest && (
          <p className="meta">제출 {formatDateTime(attempt.mentorRequest.submittedAt)}</p>
        )}
        {waitingOnMentor && (
          <p className="meta">
            {activeStage?.mentorName ? `${activeStage.mentorName} 멘토가` : '배정된 멘토가'} 검토 중입니다 · 검토가
            끝나면 알림으로 알려드립니다
          </p>
        )}
        <p role="status" aria-live="polite" className={styles.announcement}>
          {announcement}
        </p>
      </div>

      <div className={styles.progressRow}>
        <ProgressBar value={doneCount} max={reviewStages.length} />
        <span className="meta">
          {done ? '검증 완료' : `${Math.min(doneCount + 1, reviewStages.length)} / ${reviewStages.length} 단계 진행 중`}
        </span>
      </div>

      <ol className={styles.timeline}>
        {reviewStages.map((stage, i) => {
          const config = STAGE_CONFIG[i];
          return (
            <li key={stage.id} className={styles.stageItem} data-status={stage.status}>
              <span className={styles.node} aria-hidden="true">
                {stage.status === 'done' ? '✓' : i + 1}
              </span>
              {stage.status === 'active' ? (
                <div className={styles.activeCard}>
                  {stage.mentorName && (
                    <div className={styles.mentorRow}>
                      <span className={styles.avatar} aria-hidden="true">
                        {stage.mentorName[0]}
                      </span>
                      <div>
                        <p className={styles.mentorName}>{stage.mentorName}</p>
                        {config.mentorRole && <p className="meta">{config.mentorRole}</p>}
                      </div>
                    </div>
                  )}
                  <p className={styles.workingCopy}>{config.workingCopy}</p>
                </div>
              ) : (
                <div className={styles.collapsedRow}>
                  <span className={styles.stageLabel}>{stage.label}</span>
                  {stage.status === 'done' && stage.completedAt && (
                    <span className={styles.timestamp}>
                      {new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
                        new Date(stage.completedAt),
                      )}
                    </span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {done && (
        <div className={styles.doneCard}>
          <p>멘토 검증이 완료되었습니다.</p>
          <Button variant="primary" onClick={() => navigate('/portfolio/report')}>
            3단계 · 통합 리포트 보기 →
          </Button>
        </div>
      )}

      {fast && <p className={styles.fastBadge}>?fast=1 가속 모드 (10배속)</p>}
      <p className={styles.constraintNote}>
        이 화면을 떠나도 검증은 계속됩니다. 단, 같은 브라우저에서만 진행 상태를 확인할 수 있습니다.
      </p>
    </div>
  );
}
