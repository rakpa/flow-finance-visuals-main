
import { useState, useEffect } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the default browser install prompt
      event.preventDefault();
      // Store the event for later use
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // App was installed
      setIsInstalled(true);
      setIsInstallable(false);
    };

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptToInstall = async () => {
    if (!installPrompt) {
      console.log('Install prompt not available');
      return;
    }

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    // Reset the install prompt variable
    setInstallPrompt(null);
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  return { isInstallable, isInstalled, promptToInstall };
}
