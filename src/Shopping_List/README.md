# Shopping list feature

`Shopping_List.tsx` is the route entry point. `ShoppingList.tsx` is the shared presentation component used by both lists; `editable` enables manual controls without duplicating list markup. `ProgrammaticShoppingList.tsx` owns the meal-plan list state and its typed provider API. Types and feature-scoped CSS live alongside those files, and `index.ts` is the public boundary.

`TemporaryProgrammaticShoppingListDemo.tsx` is temporary startup-only demo code. It runs an effect once per provider lifetime and adds `Tomatoes` through the public API; the ref guard prevents React StrictMode effect replay from adding it twice. To disable it, change `ENABLE_TEMPORARY_STARTUP_DEMO` to `false` in that file. When the demo is no longer needed, remove that file and remove the `<TemporaryProgrammaticShoppingListDemo />` child from the provider in `Shopping_List.tsx`.

Future features should wrap their UI in `ProgrammaticShoppingListProvider` and call the exported `useProgrammaticShoppingList` hook:

```tsx
const { api } = useProgrammaticShoppingList();
const id = api.add({ name: 'Carrots' });
api.change(id, { checked: true });
api.remove(id);
```

A future button component can use the same API from its click handler:

```tsx
function AddIngredientButton() {
  const { api } = useProgrammaticShoppingList();
  return <button onClick={() => api.add({ name: 'Carrots' })}>Add carrots</button>;
}
```

That component must be rendered inside the existing provider. If it currently lives outside the provider, move the provider upward to the nearest shared parent and render both the shopping-list UI and the button beneath that one provider. Do not add a second provider, or the components will receive separate lists.

Names are trimmed and case-insensitive duplicates or blank names throw a descriptive error. `remove` and `change` return `false` for unknown IDs; successful operations return `true` (and `add` returns the stable item ID). Current state is local React state, so refreshing resets both lists. Later, the provider can replace its state updates with persistence without changing consumers.

The desktop grid gives each card a flexible item region with its own `overflow-y: auto`; headings and controls stay outside that region. At small widths the cards stack and the page remains naturally scrollable rather than clipping content. There is no test runner configured, so the API example above is the focused development example and does not seed production UI data.

