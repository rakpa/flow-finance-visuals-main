
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/hooks/use-pwa-install';

export function InstallPwa() {
  const { isInstallable, promptToInstall } = usePwaInstall();

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={promptToInstall} 
        variant="default"
        className="flex items-center gap-2 shadow-lg"
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    </div>
  );
}
