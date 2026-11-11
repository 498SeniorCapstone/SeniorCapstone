export type ShoppingListItem = {
  id: string;
  name: string;
  checked: boolean;
};

export type ShoppingListItemInput = {
  name: string;
  checked?: boolean;
};

export type ShoppingListItemChanges = Partial<Pick<ShoppingListItem, 'name' | 'checked'>>;

