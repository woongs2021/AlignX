import { SectionHeader } from '@/components/SectionHeader';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './PipelineSection.module.css';

const STAGES = ['문서 파싱', '레이아웃 추출', '시각 토큰 추출', '내러티브 파싱', '스코어링'];

const BOX_WIDTH = 140;
const BOX_HEIGHT = 70;
const GAP = 30;
const MARGIN = 10;
const Y = 45;

function boxX(index: number): number {
  return MARGIN + index * (BOX_WIDTH + GAP);
}

const VIEW_WIDTH = MARGIN * 2 + STAGES.length * BOX_WIDTH + (STAGES.length - 1) * GAP;
const VIEW_HEIGHT = Y * 2 + BOX_HEIGHT + 30;

/** 5단계 분석 파이프라인 — SVG로 직접 그린다(이미지 아님), 다크모드/확대에서 안 깨진다 (08 §A2). */
export function PipelineSection() {
  return (
    <SectionAnchor id="how">
      <section className={styles.section}>
        <SectionHeader eyebrow="HOW" title="5단계 분석 파이프라인" className={styles.header} />

        <div className={styles.diagramWrap}>
          <svg
            className={styles.diagram}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            role="img"
            aria-label={`분석 파이프라인: ${STAGES.join(' → ')}`}
          >
            {STAGES.map((stage, i) => {
              const isFinal = i === STAGES.length - 1;
              const x = boxX(i);
              return (
                <g key={stage}>
                  <rect
                    x={x}
                    y={Y}
                    width={BOX_WIDTH}
                    height={BOX_HEIGHT}
                    rx={16}
                    className={styles.box}
                    data-final={isFinal}
                  />
                  <text x={x + BOX_WIDTH / 2} y={Y - 12} className={styles.number}>
                    0{i + 1}
                  </text>
                  <text x={x + BOX_WIDTH / 2} y={Y + BOX_HEIGHT / 2 + 5} className={styles.label} data-final={isFinal}>
                    {stage}
                  </text>
                  {i < STAGES.length - 1 && (
                    <g>
                      <line
                        x1={x + BOX_WIDTH}
                        y1={Y + BOX_HEIGHT / 2}
                        x2={x + BOX_WIDTH + GAP - 8}
                        y2={Y + BOX_HEIGHT / 2}
                        className={styles.arrow}
                      />
                      <polygon
                        points={`${x + BOX_WIDTH + GAP - 8},${Y + BOX_HEIGHT / 2 - 5} ${x + BOX_WIDTH + GAP},${Y + BOX_HEIGHT / 2} ${x + BOX_WIDTH + GAP - 8},${Y + BOX_HEIGHT / 2 + 5}`}
                        className={styles.arrowHead}
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </section>
    </SectionAnchor>
  );
}
