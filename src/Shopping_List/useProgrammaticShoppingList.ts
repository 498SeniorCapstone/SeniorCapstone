import { useContext } from 'react';
import { ProgrammaticShoppingListContext } from './programmaticShoppingListContext';
import type { ProgrammaticShoppingListContextValue } from './programmaticShoppingListContext';

export function useProgrammaticShoppingList(): ProgrammaticShoppingListContextValue {
  const context = useContext(ProgrammaticShoppingListContext);
  if (!context) throw new Error('useProgrammaticShoppingList must be used inside ProgrammaticShoppingListProvider.');
  return context;
}

