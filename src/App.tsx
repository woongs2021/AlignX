import { AppRouter } from '@/router';
import { useSyncMode } from '@/theme/useSyncMode';

export function App() {
  useSyncMode();
  return <AppRouter />;
}
