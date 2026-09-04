import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './Popover.module.css';

type PopoverProps = {
  label: string;
  align?: 'left' | 'right';
  trigger: (props: { onClick: () => void; isOpen: boolean }) => ReactNode;
  children: (close: () => void) => ReactNode;
  className?: string;
};

/** 트리거 하단에 뜨는 팝오버 — Modal/MobileNav와 달리 오버레이·스크롤 잠금이 없다("그 자리
 * 하단에 팝업"). 트리거+패널을 한 컨테이너로 감싸 바깥 클릭만 닫히게 한다 — AttemptCard의
 * 기존 ⋯메뉴와 같은 패턴이라 트리거를 다시 눌러도 닫혔다 즉시 재열리는 버그가 없다. */
export function Popover({ label, align = 'right', trigger, children, className }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  function closeAndFocusTrigger() {
    setIsOpen(false);
    wrapRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAndFocusTrigger();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const classes = [styles.wrap, className].filter(Boolean).join(' ');
  const panelClasses = [styles.panel, align === 'left' && styles.alignLeft].filter(Boolean).join(' ');

  // children의 close 콜백은 렌더 중에 참조되므로 ref를 건드리지 않는 순수 상태 변경만 준다
  // (react-hooks/refs) — 포커스를 트리거로 되돌리는 동작은 Esc 키 경로(effect 내부)에서만 한다.
  function closeOnly() {
    setIsOpen(false);
  }

  return (
    <div ref={wrapRef} className={classes}>
      {trigger({ onClick: () => setIsOpen((v) => !v), isOpen })}
      {isOpen && (
        <div role="menu" aria-label={label} className={panelClasses}>
          {children(closeOnly)}
        </div>
      )}
    </div>
  );
}
