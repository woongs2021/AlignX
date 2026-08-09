import { Link } from 'react-router-dom';
import { AlignXLogo } from '@/components/AlignXLogo';
import styles from './Footer.module.css';

/** 고정 다크 푸터 — 라이트 모드에서도 --deep 유지 (Plans/03-layout-navigation.md §5). ADMIN 링크 없음. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div>
          <AlignXLogo className={styles.logo} />
          <p className={styles.tagline}>AI와 사람이 함께 검증하는 포트폴리오</p>
        </div>

        <div>
          <p className={styles.heading}>서비스</p>
          <nav className={styles.list} aria-label="서비스">
            <Link to="/portfolio" className={styles.link}>
              포트폴리오 분석
            </Link>
            <Link to="/alignx" className={styles.link}>
              AlignX AI
            </Link>
            <Link to="/my" className={styles.link}>
              MY
            </Link>
          </nav>
        </div>

        <div>
          <p className={styles.heading}>정보</p>
          <nav className={styles.list} aria-label="정보">
            <Link to="/about" className={styles.link}>
              ABOUT
            </Link>
            <span className={styles.link}>이용약관</span>
            <span className={styles.link}>개인정보처리방침</span>
          </nav>
        </div>

        <div>
          <p className={styles.heading}>고지</p>
          <p className={styles.notice}>MVP 데모입니다. 모든 데이터는 브라우저에만 저장됩니다.</p>
        </div>
      </div>
    </footer>
  );
}
