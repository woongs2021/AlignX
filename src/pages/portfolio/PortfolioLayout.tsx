import { Outlet } from 'react-router-dom';
import { StepIndicator } from './StepIndicator';

export function PortfolioLayout() {
  return (
    <div>
      <StepIndicator />
      <Outlet />
    </div>
  );
}
