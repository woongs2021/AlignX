import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import styles from './UploadZone.module.css';

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles.icon}
    >
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

type UploadZoneProps = {
  onFileSelected: (file: File) => void;
  onMultipleRejected: () => void;
};

/** idle 상태 업로드 존 — 드래그앤드롭 + 클릭 + 키보드 3경로 지원 (05 §3.1). */
export function UploadZone({ onFileSelected, onMultipleRejected }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (fileList.length > 1) {
      onMultipleRejected();
      return;
    }
    onFileSelected(fileList[0]);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current += 1;
    setIsDragActive(true);
  }

  // dragleave는 자식 요소를 지날 때도 발생한다 — 카운터가 0이 될 때만 실제로 벗어난 것으로 본다.
  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragActive(false);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = '';
  }

  return (
    <div
      className={[styles.zone, isDragActive && styles.dragActive].filter(Boolean).join(' ')}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <UploadIcon />
      <p className={styles.title}>포트폴리오를 여기에 놓으세요</p>
      <label className={styles.pickButton}>
        또는 파일 선택
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif"
          className={styles.hiddenInput}
          onChange={handleInputChange}
        />
      </label>
      <p className={styles.meta}>PDF · PNG · JPEG · GIF · 최대 50MB · 1개 파일</p>
    </div>
  );
}
