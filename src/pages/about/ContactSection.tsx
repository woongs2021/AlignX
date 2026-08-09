import { SectionHeader } from '@/components/SectionHeader';
import { Badge } from '@/components/Badge';
import { SectionAnchor } from '@/layout/SectionAnchor';
import styles from './ContactSection.module.css';

const CONTACT_EMAIL = 'hello@alignx.demo';

export function ContactSection() {
  return (
    <SectionAnchor id="contact">
      <section className={`container ${styles.section}`}>
        <SectionHeader eyebrow="CONTACT" title="문의하기" className={styles.header} />
        <div className={styles.note}>
          <Badge variant="outline">데모 서비스</Badge>
          <p className={styles.text}>
            AlignX는 현재 데모 목적으로 운영되는 서비스입니다. 문의나 피드백은 아래 이메일로
            보내주세요.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className={styles.email}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </SectionAnchor>
  );
}
