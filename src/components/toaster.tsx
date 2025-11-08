import { Toaster } from './ui/sonner';

export function AppToaster() {
  return (
    <Toaster 
      position="top-right"
      theme="dark"
      richColors
      closeButton
    />
  );
}