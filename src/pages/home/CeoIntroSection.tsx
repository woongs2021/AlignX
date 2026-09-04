import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { revealItem, useReveal } from '@/layout/useReveal';
import styles from './CeoIntroSection.module.css';

const HIGHLIGHTS = [
  'Apple Singapore·Korea(2014–2021) — Core Image · SceneKit · Core ML 개발',
  'Korea University B.S. · UT Austin M.S. Computer Science',
  'KAIST · 고려대 · 서강대 대학원 OpenUSD 공간컴퓨팅 강의',
  'NVIDIA Isaac Sim · OpenUSD 기반 Physical AI 연구',
];

const RESUME_SECTIONS: { label: string; items: string[] }[] = [
  {
    label: 'Professional Experience',
    items: [
      'Apple Singapore (2014–2018) — Core Image API 설계 및 기능 고도화',
      'Apple Singapore (2014–2018) — SceneKit 렌더링 파이프라인 안정성 개선 및 성능 최적화',
      'Apple Singapore (2014–2018) — iOS 10~12 플랫폼 릴리즈 참여',
      'Apple Korea (2018–2021) — Core ML MLCustomModel 개발',
      'Apple Korea (2018–2021) — 머신러닝 모델 로딩·추론·런타임 디버깅',
      'Graphics, Imaging, Machine Learning, Platform Engineering 조직 협업',
      '온디바이스 AI 및 컴퓨터 비전 프레임워크 개발 참여',
    ],
  },
  {
    label: 'Teaching Experience',
    items: [
      'KAIST 석사과정 OpenUSD 기반 공간컴퓨팅 강의',
      '고려대학교 DXP LAB 석사과정 OpenUSD 강의',
      '서강대학교 A&T 대학원 OpenUSD 강의',
      '국립금오공과대학교 Computer Vision 및 손동작 추론 개발 과정 강의',
    ],
  },
  {
    label: 'Research & Industry Engagement',
    items: [
      'Apple·NVIDIA 생태계 기반 OpenUSD 연구 수행',
      'OpenUSD 기반 디지털 트윈 및 공간컴퓨팅 연구',
      '실시간 3D 데이터 상호운용성 및 시뮬레이션 워크플로우 연구',
      'Apple Tokyo Vision Pro Lab 초청',
      'Vision Pro 개발 환경 및 Spatial Computing 워크플로우 검토',
    ],
  },
  {
    label: 'Technical Skills',
    items: [
      'Swift, Objective-C, C/C++, Python',
      'Core ML, Core Image, SceneKit, UIKit, SwiftUI',
      'NVIDIA Isaac Sim, Omniverse, OpenUSD',
      'Digital Twin, Robot Simulation, Synthetic Data Generation',
      'Computer Vision, Spatial Computing, 3D Rendering',
    ],
  },
  {
    label: 'Education',
    items: [
      'Korea University — B.S. Electronic Physics',
      'The University of Texas at Austin — M.S. Computer Science',
    ],
  },
];

const CEO_PHOTO_SRC = `${import.meta.env.BASE_URL}images/ceo-profile/ceo-profile.webp`;
const CEO_RESUME_PDF_SRC = `${import.meta.env.BASE_URL}images/ceo-profile/ceo-resume.pdf`;

/** HOME CTA 밴드 바로 위 — 대표(김학진) 소개 카드. 이력서 PDF 원문을 요약해 카드엔
 * 대표 이력만 짧게, 팝업엔 전체 이력을 보여준다. */
export function CeoIntroSection() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListScrolling, setIsListScrolling] = useState(false);
  const [thumb, setThumb] = useState({ top: 0, height: 0 });
  const resumeScrollRef = useRef<HTMLDivElement>(null);

  // 네이티브 스크롤바는 숨기고, 대신 위치·크기를 계산한 커스텀 썸을 스크롤하는 동안만 보여준다
  // — motion으로 opacity를 다루면 네이티브 스크롤바보다 사라지는 모션을 훨씬 매끄럽게 통제할 수 있다.
  useEffect(() => {
    const el = resumeScrollRef.current;
    if (!isModalOpen || !el) return;

    let hideTimer: number;

    function updateThumb() {
      if (!el) return;
      const trackHeight = el.clientHeight;
      const contentHeight = el.scrollHeight;
      if (contentHeight <= trackHeight) {
        setThumb({ top: 0, height: 0 });
        return;
      }
      const thumbHeight = Math.max(24, (trackHeight / contentHeight) * trackHeight);
      const maxScrollTop = contentHeight - trackHeight;
      const top = (el.scrollTop / maxScrollTop) * (trackHeight - thumbHeight);
      setThumb({ top, height: thumbHeight });
    }

    function handleScroll() {
      updateThumb();
      setIsListScrolling(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setIsListScrolling(false), 800);
    }

    updateThumb();
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.clearTimeout(hideTimer);
    };
  }, [isModalOpen]);

  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          ref={ref}
          variants={revealItem}
          initial="hidden"
          animate={revealed ? 'visible' : 'hidden'}
        >
          <Card variant="soft" className={styles.card}>
            <div className={styles.photoWrap}>
              <img
                src={CEO_PHOTO_SRC}
                alt="김학진 AlignX 대표"
                className={styles.photo}
                loading="lazy"
              />
            </div>
            <div className={styles.content}>
              <p className={`label ${styles.eyebrow}`}>CEO</p>
              <h2 className={`kr-3 ${styles.title}`}>
                애플 출신 CEO가 직접 AlignX AI 모델을 설계하고, 실리콘밸리 및 국내 대기업 전문
                멘토진을 리딩합니다
              </h2>
              <ul className={styles.highlights}>
                {HIGHLIGHTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button
                variant="secondary"
                className={styles.resumeButton}
                onClick={() => setIsModalOpen(true)}
              >
                대표 이력 자세히 보기
              </Button>
            </div>
          </Card>
        </motion.div>

        <Link to="/about#team" className={styles.mentorLink}>
          검증에 참여하는 멘토진 보러가기 →
        </Link>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="김학진">
        <div className={styles.resumeDetail}>
          <button
            type="button"
            className={styles.resumeClose}
            onClick={() => setIsModalOpen(false)}
            aria-label="닫기"
          >
            ×
          </button>

          <div className={styles.resumeHead}>
            <span className={styles.resumeAvatar}>
              <img src={CEO_PHOTO_SRC} alt="" className={styles.resumeAvatarImg} />
            </span>
            <div>
              <p className={styles.resumeRole}>AlignX CEO</p>
              <p className={styles.resumeMeta}>
                Apple 플랫폼 엔지니어 · OpenUSD 연구자 · 공간컴퓨팅 및 Physical AI 전문가
              </p>
            </div>
          </div>

          <div className={styles.resumeScrollWrap}>
            <div ref={resumeScrollRef} className={styles.resumeScroll}>
              {RESUME_SECTIONS.map((section) => (
                <div key={section.label} className={styles.resumeBlock}>
                  <p className={styles.resumeLabel}>{section.label}</p>
                  <ul className={styles.resumeList}>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <a
                href={CEO_RESUME_PDF_SRC}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resumeLink}
              >
                이력서 PDF 원본 보기 ↗
              </a>
            </div>

            <motion.div
              className={styles.resumeScrollThumb}
              style={{ top: thumb.top, height: thumb.height }}
              animate={{ opacity: isListScrolling && thumb.height > 0 ? 1 : 0 }}
              transition={{ duration: isListScrolling ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </Modal>
    </section>
  );
}
