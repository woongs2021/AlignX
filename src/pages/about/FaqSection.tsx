import { SectionHeader } from '@/components/SectionHeader';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './FaqSection.module.css';

const FAQ_ITEMS = [
  {
    q: '분석 결과는 얼마나 정확한가요?',
    a: '현재 공개된 점수는 데모용 시뮬레이션 결과입니다. 실제 AlignX 모델의 추론 결과가 아니며, 모델 연동은 준비 중입니다.',
  },
  {
    q: '어떤 파일을 올릴 수 있나요?',
    a: 'PDF, PNG, JPEG, GIF 형식을 지원하며 최대 50MB까지 업로드할 수 있습니다.',
  },
  {
    q: '제 포트폴리오는 어디에 저장되나요?',
    a: '브라우저 로컬 저장소에만 저장됩니다. 서버로 전송되지 않으며, 기기를 바꾸거나 저장소를 지우면 사라집니다.',
  },
  {
    q: '멘토 검증은 실제 사람이 하나요?',
    a: '데모에서는 멘토 검증 과정을 시뮬레이션으로 재현합니다. 실제 멘토 배정은 준비 중입니다.',
  },
  {
    q: '결과를 어떻게 공유하나요?',
    a: 'AI 분석과 멘토 검증을 합친 리포트를 HTML 파일로 다운로드할 수 있습니다.',
  },
  {
    q: '여러 번 분석할 수 있나요?',
    a: '분석 횟수에는 제한이 없습니다. 3회 이상 진행하면 이력 비교 분석이 열립니다.',
  },
];

export function FaqSection() {
  return (
    <SectionAnchor id="faq">
      <section className={`container ${styles.section}`}>
        <SectionHeader eyebrow="FAQ" title="자주 묻는 질문" className={styles.header} />
        <div className={styles.list}>
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary className={styles.question}>{item.q}</summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </SectionAnchor>
  );
}
