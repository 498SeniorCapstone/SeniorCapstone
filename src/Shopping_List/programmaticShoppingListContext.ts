import { createContext } from 'react';
import type { ShoppingListItem } from './types';
import type { ProgrammaticShoppingListApi } from './ProgrammaticShoppingList';

export type ProgrammaticShoppingListContextValue = {
  items: ShoppingListItem[];
  api: ProgrammaticShoppingListApi;
};

export const ProgrammaticShoppingListContext = createContext<ProgrammaticShoppingListContextValue | null>(null);

