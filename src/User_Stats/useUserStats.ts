import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';

type UserRecipeRow = {
  recipe_id: number;
  status: string | null;
};

type RecipeRow = {
  id: number;
  Name: string | null;
  Cuisine: string | null;
  'Meal Type': string | null;
  'Diet type': string[] | null;
  Time: number | null;
  Nutrition: number[] | null;
};


export const NUTRITION_FIELDS: ({ label: string; unit: string } | null)[] = [
  { label: 'Calories', unit: 'kcal' },  // 0
  { label: 'Carbs', unit: 'g' },        // 1
  { label: 'Protein', unit: 'g' },      // 2
  { label: 'Fiber', unit: 'g' },        // 3
  { label: 'Fat', unit: 'g' },          // 4
  { label: 'Vitamin C', unit: 'mg' },   // 5
  { label: 'Iron', unit: 'mg' },        // 6
  { label: 'Sodium', unit: 'mg' },      // 7
];

export type NutrientAverage = { label: string; unit: string; avg: number };

/** Every stat here is calculated only from recipes the user has marked "tried". */
export type UserStats = {
  tried: number;                // number of recipes marked tried
  minutesCooked: number;        // total cook time across tried recipes
  avgTriedTime: number | null;  // average minutes per tried recipe
  quickMealsTried: number;      // tried recipes at or under QUICK_MEAL_MINUTES
  cuisinesTried: number;        // distinct cuisines among tried recipes
  topCuisine: string | null;    // most-cooked cuisine
  topMealType: string | null;   // most-cooked meal type
  topDiet: string | null;       // most common diet type among tried recipes
  cuisineBreakdown: { name: string; count: number }[]; // tried recipes per cuisine, most first
  nutritionAverages: NutrientAverage[]; // average per tried recipe, for each NUTRITION_FIELDS entry with data
  topProteinRecipe: { name: string; grams: number } | null; // highest-protein tried recipe
};

export const QUICK_MEAL_MINUTES = 15;

// Same normalization as My_Recipes, so "Tried", "tried " and "TRIED" all count.
export const normalizeStatus = (str: string | null | undefined) =>
  str ? str.toLowerCase().replace(/-/g, ' ').trim() : '';

function countValues(values: (string | null | undefined)[]) {
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = v?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const mostCommon = (values: (string | null | undefined)[]) => countValues(values)[0]?.name ?? null;

export function computeStats(userRecipes: UserRecipeRow[], recipes: RecipeRow[]): UserStats {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const triedRows = userRecipes.filter((ur) => normalizeStatus(ur.status) === 'tried');
  const triedRecipes = triedRows
    .map((ur) => byId.get(ur.recipe_id))
    .filter((r): r is RecipeRow => r !== undefined);

  const times = triedRecipes
    .map((r) => r.Time)
    .filter((t): t is number => typeof t === 'number' && t > 0);
  const minutesCooked = times.reduce((sum, t) => sum + t, 0);
  const cuisineBreakdown = countValues(triedRecipes.map((r) => r.Cuisine));

  // Average each nutrient across tried recipes that have a number in that position.
  const nutrientAt = (r: RecipeRow, i: number) => {
    const v = r.Nutrition?.[i];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };
  const nutritionAverages: NutrientAverage[] = NUTRITION_FIELDS.flatMap((field, i) => {
    if (!field) return [];
    const values = triedRecipes.map((r) => nutrientAt(r, i)).filter((v): v is number => v !== null);
    if (values.length === 0) return [];
    const avg = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    return [{ ...field, avg }];
  });

  const proteinIndex = NUTRITION_FIELDS.findIndex((f) => f?.label.toLowerCase() === 'protein');
  let topProteinRecipe: UserStats['topProteinRecipe'] = null;
  if (proteinIndex >= 0) {
    for (const r of triedRecipes) {
      const grams = nutrientAt(r, proteinIndex);
      if (grams !== null && r.Name && (!topProteinRecipe || grams > topProteinRecipe.grams)) {
        topProteinRecipe = { name: r.Name, grams: Math.round(grams) };
      }
    }
  }

  return {
    tried: triedRows.length,
    minutesCooked,
    avgTriedTime: times.length ? Math.round(minutesCooked / times.length) : null,
    quickMealsTried: times.filter((t) => t <= QUICK_MEAL_MINUTES).length,
    cuisinesTried: cuisineBreakdown.length,
    topCuisine: cuisineBreakdown[0]?.name ?? null,
    topMealType: mostCommon(triedRecipes.map((r) => r['Meal Type'])),
    topDiet: mostCommon(triedRecipes.flatMap((r) => r['Diet type'] ?? [])),
    cuisineBreakdown,
    nutritionAverages,
    topProteinRecipe,
  };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('my_recipes')
        .select('recipe_id, status');
      if (cancelled) return;
      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }
      const userRecipes = (userData as UserRecipeRow[]) ?? [];

      // Only look up the recipes marked tried.
      const triedIds = [
        ...new Set(
          userRecipes
            .filter((ur) => normalizeStatus(ur.status) === 'tried')
            .map((ur) => ur.recipe_id)
        ),
      ];

      let recipes: RecipeRow[] = [];
      if (triedIds.length > 0) {
        const { data, error } = await supabase
          .from('recipe')
          .select('id, Name, Cuisine, "Meal Type", "Diet type", Time, Nutrition')
          .in('id', triedIds);
        if (cancelled) return;
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        recipes = (data as RecipeRow[]) ?? [];
      }

      setStats(computeStats(userRecipes, recipes));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}