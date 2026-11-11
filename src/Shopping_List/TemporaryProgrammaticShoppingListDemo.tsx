import { useEffect, useRef } from 'react';
import { useProgrammaticShoppingList } from './useProgrammaticShoppingList';

// TEMPORARY STARTUP DEMO: set this to false, then remove this file when the demo is no longer needed.
const ENABLE_TEMPORARY_STARTUP_DEMO = true;

export function TemporaryProgrammaticShoppingListDemo() {
  const { api } = useProgrammaticShoppingList();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!ENABLE_TEMPORARY_STARTUP_DEMO || hasInitialized.current) return;

    hasInitialized.current = true;
    const tomatoId = api.add({ name: 'Tomatoes' });
    api.remove(tomatoId);
  }, [api]);

  return null;
}

