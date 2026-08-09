import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/layout/usePageMeta';
import { useAppStore } from '@/store/useAppStore';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { buildHistoryData } from '@/features/history/historyData';
import { buildHistoryHtml, historyFileName } from '@/features/history/buildHistoryHtml';
import { downloadHtmlFile } from '@/lib/download';
import { GrowthSummary } from './history/GrowthSummary';
import { ScoreTrendChart } from './history/ScoreTrendChart';
import { PrincipleChangeTable } from './history/PrincipleChangeTable';
import { MentorArchive } from './history/MentorArchive';
import styles from './MyHistoryPage.module.css';

/** 전체 이력 분석 — 3회 이상일 때만 접근 가능(라우트 가드는 router.tsx) (Plans/09-my.md §6). */
export function MyHistoryPage() {
  usePageMeta({ title: '전체 이력 분석 — AlignX' });
  const navigate = useNavigate();
  const attempts = useAppStore((s) => s.attempts);
  const data = buildHistoryData(attempts);
  const name = attempts.find((a) => a.mentorRequest)?.mentorRequest?.name ?? '게스트';

  if (!data) {
    return (
      <div className="container">
        <button type="button" className={styles.backLink} onClick={() => navigate('/my')}>
          ← MY로 돌아가기
        </button>
        <SectionHeader eyebrow="MY · HISTORY" title="전체 이력 분석" />
        <p className="meta">완료된(멘토 검증까지 끝난) 회차가 아직 없어 이력을 분석할 수 없습니다.</p>
      </div>
    );
  }

  function handleDownload() {
    if (!data) return;
    downloadHtmlFile(buildHistoryHtml(data, name), historyFileName(name));
  }

  return (
    <div className={`container ${styles.page}`}>
      <button type="button" className={styles.backLink} onClick={() => navigate('/my')}>
        ← MY로 돌아가기
      </button>

      <SectionHeader eyebrow="MY · HISTORY" title={`${name}님의 성장 추이`} />
      <p className="meta">
        완료 {data.completedCount}회 기준{data.isPartial ? ' (진행 중인 회차는 제외했습니다)' : ''}
      </p>

      <section className={styles.section}>
        <GrowthSummary data={data} />
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>총점 추이</p>
        <ScoreTrendChart points={data.chartPoints} />
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>원칙별 변화</p>
        <PrincipleChangeTable
          rows={data.principleRows}
          topImproved={data.topImproved}
          stagnantPrinciples={data.stagnantPrinciples}
          attemptCount={data.completedCount}
        />
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>해석</p>
        <ul className={styles.insights}>
          {data.insights.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>멘토 코멘트 아카이브</p>
        <MentorArchive entries={data.mentorArchive} />
      </section>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleDownload}>
          전체 이력 리포트 HTML 다운로드
        </Button>
      </div>
    </div>
  );
}
