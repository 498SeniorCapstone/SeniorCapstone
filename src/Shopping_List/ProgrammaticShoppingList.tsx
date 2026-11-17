import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ShoppingListItem, ShoppingListItemChanges, ShoppingListItemInput } from './types';
import { ProgrammaticShoppingListContext } from './programmaticShoppingListContext';

export type ProgrammaticShoppingListApi = {
  add: (item: ShoppingListItemInput) => string;
  remove: (id: string) => boolean;
  change: (id: string, changes: ShoppingListItemChanges) => boolean;
};

const createItemId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `shopping-item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeName = (name: string): string => name.trim();
const findDuplicate = (items: ShoppingListItem[], name: string, ignoreId?: string): boolean =>
  items.some((item) => item.id !== ignoreId && item.name.toLocaleLowerCase() === name.toLocaleLowerCase());

export function ProgrammaticShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const itemsRef = useRef(items);

  const replaceItems = (nextItems: ShoppingListItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
  };

  const add = useCallback((input: ShoppingListItemInput): string => {
    const name = normalizeName(input.name);
    if (!name) throw new Error('Shopping list item names cannot be blank.');
    if (findDuplicate(itemsRef.current, name)) throw new Error(`“${name}” is already on the meal plan shopping list.`);
    const id = createItemId();
    replaceItems([...itemsRef.current, { id, name, checked: input.checked ?? false }]);
    return id;
  }, []);

  const remove = useCallback((id: string): boolean => {
    const currentItems = itemsRef.current;
    if (!currentItems.some((item) => item.id === id)) return false;
    replaceItems(currentItems.filter((item) => item.id !== id));
    return true;
  }, []);

  const change = useCallback((id: string, changes: ShoppingListItemChanges): boolean => {
    const currentItems = itemsRef.current;
    const existing = currentItems.find((item) => item.id === id);
    if (!existing) return false;
    if (changes.name !== undefined && !normalizeName(changes.name)) throw new Error('Shopping list item names cannot be blank.');
    const name = changes.name === undefined ? existing.name : normalizeName(changes.name);
    if (findDuplicate(currentItems, name, id)) throw new Error(`“${name}” is already on the meal plan shopping list.`);
    replaceItems(currentItems.map((item) => item.id === id ? { ...item, ...changes, name } : item));
    return true;
  }, []);

  const value = useMemo(() => ({ items, api: { add, remove, change } }), [items, add, remove, change]);
  return <ProgrammaticShoppingListContext.Provider value={value}>{children}</ProgrammaticShoppingListContext.Provider>;
}

