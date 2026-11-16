import { useState, type FormEvent } from 'react';
import type { ShoppingListItem } from './types';

type ShoppingListProps = {
  title: string;
  description: string;
  items: ShoppingListItem[];
  editable?: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onAdd?: (name: string) => void;
  onRemove?: (id: string) => void;
  onChange?: (id: string, name: string) => void;
  feedback?: string;
};

export function ShoppingList({ title, description, items, editable = false, onToggle, onAdd, onRemove, onChange, feedback }: ShoppingListProps) {
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const slug = title.replaceAll(' ', '-').toLowerCase();

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onAdd) return;
    onAdd(newItem);
    if (newItem.trim()) setNewItem('');
  };
  const beginEditing = (item: ShoppingListItem) => { setEditingId(item.id); setEditingName(item.name); };
  const saveEdit = (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    onChange?.(id, editingName);
    if (editingName.trim()) setEditingId(null);
  };

  return (
    <section className="shopping-list-card" aria-labelledby={`${slug}-heading`}>
      <div className="shopping-list-card-header">
        <div><h2 id={`${slug}-heading`}>{title}</h2><p>{description}</p></div>
        <span className="shopping-list-count" aria-label={`${items.length} items`}>{items.length}</span>
      </div>
      {editable && <form className="shopping-list-add" onSubmit={handleAdd}>
        <label className="sr-only" htmlFor={`${slug}-input`}>Add an ingredient to {title}</label>
        <input id={`${slug}-input`} value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="e.g. Tomatoes" autoComplete="off" />
        <button type="submit">Add</button>
      </form>}
      {feedback && <p className="shopping-list-feedback" role="status">{feedback}</p>}
      <div className="shopping-list-items" aria-live="polite">
        {items.length === 0 ? <div className="shopping-list-empty"><strong>{editable ? 'Your list is ready for ingredients.' : 'No meal-plan ingredients yet.'}</strong><span>{editable ? 'Add an ingredient above to get started.' : 'Recipes will add ingredients here later.'}</span></div> :
          <ul>{items.map((item) => <li className={item.checked ? 'is-checked' : ''} key={item.id}>
            {editingId === item.id && editable ? <form className="shopping-list-edit" onSubmit={(event) => saveEdit(event, item.id)}>
              <label className="sr-only" htmlFor={`edit-${item.id}`}>Edit {item.name}</label>
              <input id={`edit-${item.id}`} value={editingName} onChange={(event) => setEditingName(event.target.value)} autoFocus />
              <button type="submit">Save</button><button type="button" className="button-secondary" onClick={() => setEditingId(null)}>Cancel</button>
            </form> : <><label className="shopping-list-item-label"><input type="checkbox" checked={item.checked} onChange={(event) => onToggle(item.id, event.target.checked)} /><span>{item.name}</span></label>
              {editable && <span className="shopping-list-item-actions"><button type="button" className="button-link" onClick={() => beginEditing(item)}>Edit</button><button type="button" className="button-link danger" onClick={() => onRemove?.(item.id)}>Remove</button></span>}</>}
          </li>)}</ul>}
      </div>
    </section>
  );
}

