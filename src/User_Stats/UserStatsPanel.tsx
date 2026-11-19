import { useUserStats, QUICK_MEAL_MINUTES } from './useUserStats.ts';
import './UserStatsPanel.css';

type Props = {
  /** compact = 4 headline numbers for the dashboard widget; default = full profile view */
  compact?: boolean;
};

function UserStatsPanel({ compact = false }: Props) {
  const { stats, loading, error } = useUserStats();

  if (loading) return <p className="user-stats-msg">Loading stats...</p>;
  if (error) return <p className="user-stats-msg">Error: {error}</p>;
  if (!stats || stats.tried === 0) {
    return (
      <p className="user-stats-msg">
        Mark a recipe as "Tried" to start building your stats.
      </p>
    );
  }

  const headline = [
    { label: 'Recipes tried', value: stats.tried },
    { label: 'Minutes cooked', value: stats.minutesCooked },
    { label: `Quick meals (≤${QUICK_MEAL_MINUTES} min)`, value: stats.quickMealsTried },
    { label: 'Avg cook time', value: stats.avgTriedTime !== null ? `${stats.avgTriedTime} min` : '—' },
  ];

  if (compact) {
    return (
      <div className="user-stats compact">
        <div className="user-stats-grid">
          {headline.map((t) => (
            <div className="user-stats-tile" key={t.label}>
              <div className="user-stats-value">{t.value}</div>
              <div className="user-stats-label">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tiles = [...headline, { label: 'Cuisines tried', value: stats.cuisinesTried }];

  const favorites = [
    { label: 'Top cuisine', value: stats.topCuisine },
    { label: 'Top meal type', value: stats.topMealType },
    { label: 'Top diet', value: stats.topDiet },
  ].filter((f) => f.value);

  const maxCuisine = stats.cuisineBreakdown[0]?.count ?? 1;

  return (
    <section className="user-stats full">
      <p className="user-stats-note">Based on the recipes you've marked "Tried".</p>

      <div className="user-stats-grid">
        {tiles.map((t) => (
          <div className="user-stats-tile" key={t.label}>
            <div className="user-stats-value">{t.value}</div>
            <div className="user-stats-label">{t.label}</div>
          </div>
        ))}
      </div>

      {stats.nutritionAverages.length > 0 && (
        <>
          <h3 className="user-stats-subheading">Nutrition per meal (average)</h3>
          <div className="user-stats-grid">
            {stats.nutritionAverages.map((n) => (
              <div className="user-stats-tile" key={n.label}>
                <div className="user-stats-value">
                  {n.avg}
                  <span className="user-stats-unit">{n.unit}</span>
                </div>
                <div className="user-stats-label">{n.label}</div>
              </div>
            ))}
          </div>
          {stats.topProteinRecipe && (
            <p className="user-stats-note user-stats-highlight">
              Most protein so far: <b>{stats.topProteinRecipe.name}</b> ({stats.topProteinRecipe.grams} g)
            </p>
          )}
        </>
      )}

      {favorites.length > 0 && (
        <>
          <h3 className="user-stats-subheading">Your go-tos</h3>
          <ul className="user-stats-favorites">
            {favorites.map((f) => (
              <li key={f.label}>
                <span>{f.label}</span>
                <b>{f.value}</b>
              </li>
            ))}
          </ul>
        </>
      )}

      {stats.cuisineBreakdown.length > 0 && (
        <>
          <h3 className="user-stats-subheading">Cuisines you've cooked</h3>
          <ul className="user-stats-cuisines">
            {stats.cuisineBreakdown.map((c) => (
              <li key={c.name}>
                <span className="name">{c.name}</span>
                <span className="track">
                  <span className="fill" style={{ width: `${(c.count / maxCuisine) * 100}%` }} />
                </span>
                <b>{c.count}</b>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default UserStatsPanel;