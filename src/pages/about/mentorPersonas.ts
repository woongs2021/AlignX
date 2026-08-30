// ABOUT "검증에 참여하는 멘토" 섹션 전용 예시 페르소나 — 전부 가상의 인물이다(실존 인물 사칭 금지).
// 리포트 채점에 쓰이는 @/data/mentors.ts(MENTORS)와는 별개 데이터다: 그쪽은 원칙별 담당 배분 등
// 실제 기능에 쓰이는 최소 3인 세트이고, 여기는 서비스가 다루는 직군 폭(기획·마케팅·디자인·개발)을
// 보여주기 위한 소개용 확장 세트다. 학력·경력의 소속 기업/학교명은 신뢰도를 보여주기 위한 예시일 뿐,
// 실제 그 인물이 해당 기업에 소속되었다는 의미가 아니다.
import type { Role } from '@/pages/portfolio/roles';

export type MentorPersona = {
  id: string;
  name: string;
  role: string; // 카드에 노출되는 짧은 직함
  category: Role;
  initial: string; // 이미지 로드 실패 시 대체 이니셜
  avatarSrc: string;
  bio: {
    focus: string; // 이 멘토가 주로 보는 포인트 한 줄
    education: string[];
    career: string[];
  };
};

function avatarUrl(file: string): string {
  return `${import.meta.env.BASE_URL}mentors/${file}`;
}

export const MENTOR_PERSONAS: MentorPersona[] = [
  {
    id: 'seyeon',
    name: '김세연',
    role: 'UX Lead',
    category: 'design',
    initial: '김',
    avatarSrc: avatarUrl('seyeon.png'),
    bio: {
      focus: '정보 구조와 사용자 흐름이 실제로 말이 되는지를 가장 먼저 봅니다.',
      education: ['서울대학교 산업디자인학과 학사', '카네기멜론대학교(CMU) HCI 석사'],
      career: ['네이버 UX디자인실 UX 디자이너', '카카오 서비스디자인팀 UX Lead', '現 프리랜스 UX 컨설턴트'],
    },
  },
  {
    id: 'dohyun',
    name: '박도현',
    role: 'Product Designer',
    category: 'design',
    initial: '박',
    avatarSrc: avatarUrl('dohyun.png'),
    bio: {
      focus: '비주얼 완성도와 인터랙션 디테일이 실제 사용성으로 이어지는지를 봅니다.',
      education: ['홍익대학교 시각디자인과 학사'],
      career: ['우아한형제들(배달의민족) 프로덕트 디자이너', '쿠팡 Design팀 시니어 디자이너', '토스(비바리퍼블리카) Product Designer'],
    },
  },
  {
    id: 'jiwoo',
    name: '이지우',
    role: 'Design Director',
    category: 'design',
    initial: '이',
    avatarSrc: avatarUrl('jiwoo.png'),
    bio: {
      focus: '개별 화면보다 포트폴리오 전체가 하나의 서사로 읽히는지를 종합적으로 봅니다.',
      education: ['KAIST 산업디자인학과 박사'],
      career: ['삼성전자 디자인경영센터 책임디자이너', 'LG전자 CX디자인연구소 수석디자이너', 'Google Design APAC 컨설턴트'],
    },
  },
  {
    id: 'hayoon',
    name: '정하윤',
    role: 'Product Strategy Lead',
    category: 'planning',
    initial: '정',
    avatarSrc: avatarUrl('hayoon.png'),
    bio: {
      focus: '문제 정의가 명확한지, 그 문제에서 실행까지 논리가 끊기지 않는지를 봅니다.',
      education: ['고려대학교 경영학과 학사', 'MIT Sloan School of Management MBA'],
      career: ['McKinsey & Company Associate', '쿠팡 Product Strategy 팀 리드', '배달의민족 신사업기획팀 PM'],
    },
  },
  {
    id: 'seoa',
    name: '윤서아',
    role: 'Growth Marketing Lead',
    category: 'marketing',
    initial: '윤',
    avatarSrc: avatarUrl('seoa.png'),
    bio: {
      focus: '숫자 근거와 캠페인 스토리가 실제 성과로 연결되는지를 냉정하게 봅니다.',
      education: ['성균관대학교 경영학과 학사'],
      career: ['당근마켓 그로스마케팅팀 마케터', '배달의민족 브랜드마케팅팀 팀장', 'Meta(페이스북) APAC Marketing Lead'],
    },
  },
  {
    id: 'minjun',
    name: '최민준',
    role: 'Senior Software Engineer',
    category: 'dev',
    initial: '최',
    avatarSrc: avatarUrl('minjun.png'),
    bio: {
      focus: '코드가 읽는 사람을 배려하는지, 설계가 요구사항 변화에 버틸 수 있는지를 봅니다.',
      education: ['KAIST 전산학부 석사'],
      career: ['네이버 클라우드플랫폼 백엔드 엔지니어', '라인플러스(LINE) Senior Software Engineer', 'Amazon Web Services(AWS) Solutions Architect'],
    },
  },
];
