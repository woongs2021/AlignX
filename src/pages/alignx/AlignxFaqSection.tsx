import { SectionHeader } from '@/components/SectionHeader';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './AlignxFaqSection.module.css';

const FAQ_ITEMS = [
  {
    q: 'AlignX AI는 실제 AI 모델인가요?',
    a: '현재 공개된 점수는 데모용 시뮬레이션 결과입니다. 실제 AlignX 모델 연동은 준비 중이며, 연동 이후에도 채점 기준과 화면 구성은 지금과 동일하게 유지됩니다.',
  },
  {
    q: '어떤 직군의 결과물도 채점할 수 있나요?',
    a: '네. 기획 · 마케팅 · 디자인 · 개발 등 직군에 관계없이 10대 원칙을 기준으로 채점합니다. 직군별 예시는 PORTFOLIO 분석 페이지에서 볼 수 있습니다.',
  },
  {
    q: 'AI 점수와 멘토 점수가 다르면 어떻게 되나요?',
    a: '두 점수는 하나로 합쳐지지 않고 원칙별로 나란히 제시됩니다. 차이가 큰 항목일수록 AI가 놓친 맥락이 있다는 뜻이니 더 주의 깊게 살펴보시면 됩니다.',
  },
  {
    q: '10대 원칙은 어떻게 정해졌나요?',
    a: '정보 위계, 구조적 정합성처럼 직군에 관계없이 결과물의 완성도를 가르는 기준 10가지로 구성했습니다. 자세한 내용은 위 PRINCIPLES 섹션을 참고해 주세요.',
  },
  {
    q: '분석에 시간이 얼마나 걸리나요?',
    a: '분석 시간은 포트폴리오 페이지 수와 이미지량에 따라 차이가 있습니다. AlignX 1차 검증은 수 분 내로, 멘토 2차 검증은 3~4일 정도 걸립니다.',
  },
  {
    q: '모델은 앞으로 더 발전하나요?',
    a: '네. 직무별 가중치, 산업별 벤치마크 등 더 정교한 채점을 위한 업데이트를 준비하고 있습니다.',
  },
];

/** AlignX AI 자주 묻는 질문 — ABOUT의 FaqSection과 인터랙션(details/summary)은 같지만
 * 토글 배지 비주얼이 달라 별도 컴포넌트로 둔다. */
export function AlignxFaqSection() {
  return (
    <SectionAnchor id="faq">
      <section className={styles.section}>
        <SectionHeader eyebrow="FAQ" title="자주 묻는 질문" className={styles.header} />
        <div className={styles.list}>
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary className={styles.question}>
                <span>{item.q}</span>
                <span className={styles.badge} aria-hidden="true">
                  <span className={styles.badgeIconPlus}>+</span>
                  <span className={styles.badgeIconMinus}>−</span>
                </span>
              </summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </SectionAnchor>
  );
}
