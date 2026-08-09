import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ToggleGroup } from './ToggleGroup';

afterEach(() => {
  cleanup();
});

describe('ToggleGroup', () => {
  it('현재 값에 해당하는 버튼만 aria-pressed=true다', () => {
    render(
      <ToggleGroup
        ariaLabel="정렬 기준"
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        value="a"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('클릭하면 선택한 옵션의 값으로 onChange를 호출한다', () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup
        ariaLabel="정렬 기준"
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        value="a"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('버튼이 폼을 제출하지 않도록 type=button이다', () => {
    render(
      <ToggleGroup ariaLabel="정렬 기준" options={[{ value: 'a', label: 'A' }]} value="a" onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('type', 'button');
  });
});
