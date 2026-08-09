import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import styles from './ErrorBoundary.module.css';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

/** 라우트 콘텐츠 렌더 중 에러가 나도 TopNav/Footer는 살아 있어 다른 페이지로 빠져나갈 수 있다
 * (Plans/12-code-review.md §4.4 "에러 바운더리로 화면 전체 크래시 방지"). */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AlignX 렌더 에러:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={`container ${styles.wrap}`}>
        <span className="label">ERROR</span>
        <h1 className={`kr-2 ${styles.title}`}>문제가 발생했습니다</h1>
        <p className="meta">화면을 표시하는 중 오류가 발생했습니다. 새로고침하면 대부분 해결됩니다.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          새로고침
        </Button>
      </div>
    );
  }
}
