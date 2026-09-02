import { Link } from 'react-router-dom';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppStore } from '@/store/useAppStore';
import styles from './StepIndicator.module.css';

type StepStatus = 'done' | 'active' | 'pending';

const STEPS = [
  { path: '/portfolio/analyze', label: 'AI 분석' },
  { path: '/portfolio/mentor', label: '멘토 검증' },
  { path: '/portfolio/report', label: '통합 리포트' },
];

function deriveStatuses(step1Done: boolean, step2Done: boolean): StepStatus[] {
  if (!step1Done) return ['active', 'pending', 'pending'];
  if (!step2Done) return ['done', 'active', 'pending'];
  return ['done', 'done', 'active'];
}

/** 진행 셸 상단 고정 — 완료된 단계만 클릭으로 되돌아갈 수 있다 (Plans/05-portfolio-step1.md §1). */
export function StepIndicator() {
  const activeAttempt = useAppStore((s) => s.attempts[0] ?? null);
  const statuses = deriveStatuses(activeAttempt?.ai != null, activeAttempt?.mentorFeedback != null);
  const currentIndex = statuses.indexOf('active');
  const currentStepNumber = currentIndex === -1 ? statuses.length : currentIndex + 1;

  return (
    <div className={styles.wrap}>
      <div className="container-narrow">
        <ol className={styles.list}>
          {STEPS.map((step, i) => {
            const status = statuses[i];
            const disabled = status === 'pending';
            const circle = status === 'done' ? '✓' : i + 1;

            return (
              <li key={step.path} className={styles.item}>
                {i > 0 && <span className={styles.connector} data-filled={statuses[i - 1] === 'done'} />}
                {disabled ? (
                  <span className={styles.node} data-status={status} aria-disabled="true">
                    <span className={styles.nodeCircle} aria-hidden="true">
                      {circle}
                    </span>
                    <span className={styles.nodeLabel}>{step.label}</span>
                  </span>
                ) : (
                  <Link
                    to={step.path}
                    className={styles.node}
                    data-status={status}
                    aria-current={status === 'active' ? 'step' : undefined}
                  >
                    <span className={styles.nodeCircle} aria-hidden="true">
                      {circle}
                    </span>
                    <span className={styles.nodeLabel}>{step.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <div className={styles.mobile}>
          <span className={styles.mobileLabel}>
            {currentStepNumber} / {STEPS.length} · {STEPS[Math.min(currentIndex, STEPS.length - 1)].label}
          </span>
          <ProgressBar value={currentStepNumber} max={STEPS.length} />
        </div>
      </div>
    </div>
  );
}
