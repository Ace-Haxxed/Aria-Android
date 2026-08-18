import { Suspense, lazy, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Lazy so it stays out of the entry chunk; this is a mobile-only build, so
// there is no second layout to choose between. Settings live inside the layout
// as a tab rather than as a modal over it.
const MobileLayout = lazy(() =>
  import('@/components/mobile/MobileLayout').then((m) => ({ default: m.MobileLayout })),
);
const FirstRun = lazy(() =>
  import('@/components/onboarding/FirstRun').then((m) => ({ default: m.FirstRun })),
);
import { SpaceBackground } from '@/components/shared/SpaceBackground';
import { ToastViewport } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/primitives';
import { useSettings } from '@/store/settings';
import { useConversation } from '@/store/conversation';
import { useConnection } from '@/store/connection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Everything here is local; refetching on focus buys nothing.
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  const loaded = useSettings((s) => s.loaded);
  const load = useSettings((s) => s.load);
  const setupComplete = useSettings((s) => s.settings.setupComplete);
  const initConversations = useConversation((s) => s.init);

  const [wizardDismissed, setWizardDismissed] = useState(false);

  // Settings must be loaded before anything can render — the LLM config, the
  // capability toggles and the accent hue all come from there.
  useEffect(() => {
    void load();
  }, [load]);

  // Conversation history is not needed to paint an empty transcript, so it is
  // fetched after the first frame rather than blocking it.
  useEffect(() => {
    if (!loaded) return;
    const handle = requestAnimationFrame(() => void initConversations());
    return () => cancelAnimationFrame(handle);
  }, [loaded, initConversations]);

  // Reach for a model in the background once setup is done. Deliberately not
  // awaited anywhere: the app must be interactive immediately, and the status
  // bar fills in whenever the answer arrives.
  useEffect(() => {
    if (loaded && setupComplete) void useConnection.getState().check();
  }, [loaded, setupComplete]);

  // Mobile chrome: match the status bar to the app background.
  useEffect(() => {
    void (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#05080d' });
      } catch {
        // Not available on every device; purely cosmetic.
      }
    })();
  }, []);

  // Handle `aria://chat?message=…` deep links and Android share intents.
  useEffect(() => {
    let remove: (() => void) | undefined;
    void (async () => {
      const { App: CapApp } = await import('@capacitor/app');
      const handle = await CapApp.addListener('appUrlOpen', ({ url }) => {
        try {
          const parsed = new URL(url);
          const message = parsed.searchParams.get('message');
          if (message) {
            // Same event the native share/PROCESS_TEXT paths emit, so there is
            // one entry point for "text arrived from outside the app".
            window.dispatchEvent(new CustomEvent('aria:shared-text', { detail: message }));
          }
        } catch {
          // A malformed deep link is not worth crashing over.
        }
      });
      remove = () => void handle.remove();
    })();

    return () => remove?.();
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  // There is no built-in model step here: the GGUF backend runs in the Tauri
  // process, which this build does not have, so a phone always reaches a model
  // over the network and goes straight to the wizard.
  const showWizard = !setupComplete && !wizardDismissed;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        {/* Behind everything, outside the app tree's stacking context so no
            component has to leave room for it. */}
        <SpaceBackground />
        <div className="relative z-10 h-full">
          {showWizard ? (
            <Suspense fallback={<div className="fixed inset-0 bg-background" />}>
              <FirstRun onComplete={() => setWizardDismissed(true)} />
            </Suspense>
          ) : (
            <Suspense fallback={<div className="h-full bg-background" />}>
              <MobileLayout />
            </Suspense>
          )}

          {/* Errors and notices land here, never as blocking modals. */}
          <ToastViewport />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
