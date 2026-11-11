import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgrammaticShoppingListProvider } from './ProgrammaticShoppingList';
import { useProgrammaticShoppingList } from './useProgrammaticShoppingList';
import { ShoppingList } from './ShoppingList';
import { TemporaryProgrammaticShoppingListDemo } from './TemporaryProgrammaticShoppingListDemo';
import type { ShoppingListItem } from './types';
import './Shopping_List.css';

function ShoppingListContent() {
  const navigate = useNavigate();
  const { items: mealPlanItems, api: mealPlanApi } = useProgrammaticShoppingList();
  const [manualItems, setManualItems] = useState<ShoppingListItem[]>([]);
  const [feedback, setFeedback] = useState('');
  const isDuplicate = (name: string, ignoreId?: string) => manualItems.some((item) => item.id !== ignoreId && item.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase());

  const addManualItem = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return setFeedback('Enter an ingredient before adding it.');
    if (isDuplicate(name)) return setFeedback(`“${name}” is already on your shopping list.`);
    setManualItems((items) => [...items, { id: crypto.randomUUID(), name, checked: false }]);
    setFeedback('');
  };
  const updateManualItem = (id: string, changes: Partial<ShoppingListItem>) => {
    if (changes.name !== undefined) {
      const name = changes.name.trim();
      if (!name) return setFeedback('Ingredient names cannot be blank.');
      if (isDuplicate(name, id)) return setFeedback(`“${name}” is already on your shopping list.`);
      setFeedback('');
      setManualItems((items) => items.map((item) => item.id === id ? { ...item, name } : item));
      return;
    }
    setManualItems((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));
  };
  const updateMealPlanItem = (id: string, checked: boolean) => {
    try { mealPlanApi.change(id, { checked }); }
    catch (error) { setFeedback(error instanceof Error ? error.message : 'Unable to update the meal plan item.'); }
  };

  return <main className="shopping-list-feature">
    <div className="shopping-list-topbar"><div><p className="shopping-list-eyebrow">Kitchen planning</p><h1>Shopping lists</h1></div><button type="button" className="shopping-list-back" onClick={() => navigate('/Dashboard')}>Back to Dashboard</button></div>
    <div className="shopping-list-grid">
      <ShoppingList title="My shopping list" description="Add the ingredients you want to remember." items={manualItems} editable feedback={feedback} onAdd={addManualItem} onToggle={(id, checked) => updateManualItem(id, { checked })} onChange={(id, name) => updateManualItem(id, { name })} onRemove={(id) => setManualItems((items) => items.filter((item) => item.id !== id))} />
      <ShoppingList title="Meal plan shopping list" description="Ingredients from future meal-plan features will appear here." items={mealPlanItems} onToggle={updateMealPlanItem} />
    </div>
  </main>;
}

function Shopping_List() {
  return <ProgrammaticShoppingListProvider><TemporaryProgrammaticShoppingListDemo /><ShoppingListContent /></ProgrammaticShoppingListProvider>;
}

export default Shopping_List
