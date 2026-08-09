import { Button } from '@/components/Button';
import { formatDateTime } from '@/lib/format';
import type { ReportData } from '@/features/report/buildReportData';
import styles from './ReportHeader.module.css';

type ReportHeaderProps = {
  report: ReportData;
  onDownload: () => void;
};

export function ReportHeader({ report, onDownload }: ReportHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <span className="label">PORTFOLIO REPORT</span>
        <h1 className={styles.title}>{report.name}님의 통합 리포트</h1>
        <p className={`meta ${styles.meta}`}>
          {report.topic} · 제출 {formatDateTime(report.submittedAt)}
        </p>
      </div>
      <Button variant="primary" onClick={onDownload}>
        HTML 다운로드
      </Button>
    </div>
  );
}
