import { useSyncExternalStore } from 'react';

let isFocusMode = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return isFocusMode;
}

export const focusModeStore = {
  setFocusMode(value: boolean) {
    if (isFocusMode !== value) {
      isFocusMode = value;
      listeners.forEach((l) => l());
    }
  },
  getSnapshot,
  subscribe,
};

interface FocusModeState {
  isFocusMode: boolean;
  setFocusMode: (value: boolean) => void;
}

export function useFocusModeStore<T>(selector: (state: FocusModeState) => T): T {
  const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector({ 
    isFocusMode: storeState, 
    setFocusMode: focusModeStore.setFocusMode 
  });
}
