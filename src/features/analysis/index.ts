// 분석 기능의 공개 API — UI는 이 파일만 import한다 (dummyEngine을 직접 import하지 않는다).
// 실 모델 연동 시 아래 provider 한 줄만 교체하면 된다 (05 §4.2, README.md 참고).
import { generateAnalysis } from './dummyEngine';
import type { AiAnalysis } from '@/types';

export interface AnalysisProvider {
  analyze(file: File, onProgress: (stageIndex: number) => void): Promise<AiAnalysis>;
}

// 더미 provider의 로딩 연출 — 6단계 · 총 9초 (05 §3.3). 실 provider로 교체하면 이 상수들도
// 함께 재검토한다(실 API는 스테이지 개념이 다를 수 있다).
export const STAGE_LABELS = [
  '파일 구조 해석',
  '핵심 구조 추출',
  '표현 방식 분석',
  '콘텐츠 내러티브 파싱',
  '10대 원칙 스코어링',
  '리포트 생성',
] as const;

export const STAGE_COPY = [
  '파일 구조를 해석하는 중입니다',
  '핵심 구조를 추출하는 중입니다',
  '표현 방식을 분석하는 중입니다',
  '콘텐츠의 흐름을 읽는 중입니다',
  '10대 원칙으로 채점하는 중입니다',
  '리포트를 생성하는 중입니다',
] as const;

const STAGE_DURATIONS_MS = [1200, 1600, 1400, 1800, 2200, 800];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const dummyProvider: AnalysisProvider = {
  async analyze(file, onProgress) {
    for (let stage = 0; stage < STAGE_DURATIONS_MS.length; stage += 1) {
      onProgress(stage);
      await wait(STAGE_DURATIONS_MS[stage]);
    }
    return generateAnalysis({ name: file.name, size: file.size });
  },
};

export const provider: AnalysisProvider = dummyProvider;
