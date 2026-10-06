/**
 * Tiny external store for the "hub is ready" signal (preloader finished).
 * Consumed through `useHubReady()` (preloader.tsx) via useSyncExternalStore,
 * and mirrored to `document.documentElement.dataset.loaded` + the `hub:ready` event.
 */
type Listener = () => void;

let ready = false;
const listeners = new Set<Listener>();

export function getHubReady(): boolean {
  return ready;
}

export function getHubReadyServer(): boolean {
  return false;
}

export function subscribeHubReady(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function markHubReady(): void {
  if (ready) return;
  ready = true;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.loaded = "true";
    window.dispatchEvent(new CustomEvent("hub:ready"));
  }
  listeners.forEach((listener) => listener());
}

export function waitForHubReady(): Promise<void> {
  if (ready) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = subscribeHubReady(() => {
      unsubscribe();
      resolve();
    });
  });
}
