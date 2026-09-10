import { useCallback, useEffect, useMemo, useState } from 'react';
import suggestionData from '../data/suggestions.json';
import { useApp } from '../context/AppContext.jsx';
import { useInterval } from '../lib/hooks.js';
import { Card, ConfirmButton, Empty, Sheet, Switch, Tag } from '../components/ui.jsx';
import {
  IconClock, IconCopy, IconDownload, IconGear, IconRefresh, IconStar, IconStarFilled, IconTrash,
} from '../components/Icons.jsx';

const LANG = 'en';
const MAX_ACTIVE = 11;
const INTERVALS = [15, 30, 60];

const CATEGORIES = suggestionData.categories;
const DEFAULT_ACTIVE = CATEGORIES.slice(0, 6).map((c) => c.categoryId);

/** Empty language arrays fall back to English so a partial German pass still works. */
const poolFor = (category) => {
  const pool = category.suggestions[LANG];
  return pool && pool.length ? pool : category.suggestions.en;
};

const labelFor = (category) => category.labels[LANG] || category.labels.en;

function pickDifferent(pool, currentValue) {
  if (!pool.length) return '';
  if (pool.length === 1) return pool[0];
  let next = currentValue;
  // No immediate repeat while the pool has an alternative.
  while (next === currentValue) next = pool[Math.floor(Math.random() * pool.length)];
  return next;
}

export default function Suggestions({ setSubtitle }) {
  const { state, patch, showToast } = useApp();
  const settings = state.suggestions;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [customInterval, setCustomInterval] = useState('');
  const [remaining, setRemaining] = useState(settings.intervalSeconds);
  const [flashKey, setFlashKey] = useState(0);

  const active = useMemo(() => {
    const ids = settings.activeCategories || DEFAULT_ACTIVE;
    return CATEGORIES.filter((c) => ids.includes(c.categoryId));
  }, [settings.activeCategories]);

  const updateSuggestions = useCallback(
    (partial) => patch((prev) => ({ suggestions: { ...prev.suggestions, ...partial } })),
    [patch],
  );

  const reroll = useCallback(() => {
    const current = { ...settings.current };
    active.forEach((category) => {
      current[category.categoryId] = pickDifferent(poolFor(category), current[category.categoryId]);
    });
    updateSuggestions({ current });
    setRemaining(settings.intervalSeconds);
    setFlashKey((k) => k + 1);
  }, [active, settings.current, settings.intervalSeconds, updateSuggestions]);

  const rerollOne = (category) => {
    updateSuggestions({
      current: {
        ...settings.current,
        [category.categoryId]: pickDifferent(poolFor(category), settings.current[category.categoryId]),
      },
    });
  };

  // Fill any category that has no value yet (first run, or newly activated).
  useEffect(() => {
    const missing = active.filter((c) => !settings.current[c.categoryId]);
    if (!missing.length) return;
    const current = { ...settings.current };
    missing.forEach((c) => { current[c.categoryId] = pickDifferent(poolFor(c), null); });
    updateSuggestions({ current });
  }, [active, settings.current, updateSuggestions]);

  useEffect(() => {
    setSubtitle(`${active.length} of ${CATEGORIES.length} categories`);
    return () => setSubtitle('');
  }, [setSubtitle, active.length]);

  useInterval(() => {
    setRemaining((r) => {
      if (r <= 1) { reroll(); return settings.intervalSeconds; }
      return r - 1;
    });
  }, settings.autoReroll ? 1000 : null);

  useEffect(() => { setRemaining(settings.intervalSeconds); }, [settings.intervalSeconds, settings.autoReroll]);

  const toggleCategory = (categoryId) => {
    const ids = settings.activeCategories || DEFAULT_ACTIVE;
    if (ids.includes(categoryId)) {
      if (ids.length === 1) { showToast('Keep at least one category active'); return; }
      updateSuggestions({ activeCategories: ids.filter((id) => id !== categoryId) });
      return;
    }
    if (ids.length >= MAX_ACTIVE) { showToast(`Maximum ${MAX_ACTIVE} categories at once`); return; }
    updateSuggestions({
      activeCategories: CATEGORIES.map((c) => c.categoryId).filter((id) => ids.includes(id) || id === categoryId),
    });
  };

  const isSaved = (category) =>
    settings.saved.some(
      (s) => s.categoryId === category.categoryId && s.value === settings.current[category.categoryId],
    );

  const toggleSave = (category) => {
    const value = settings.current[category.categoryId];
    if (!value) return;
    if (isSaved(category)) {
      updateSuggestions({
        saved: settings.saved.filter((s) => !(s.categoryId === category.categoryId && s.value === value)),
      });
      return;
    }
    updateSuggestions({
      saved: [...settings.saved, { categoryId: category.categoryId, label: labelFor(category), value }],
    });
    showToast('Starred');
  };

  const savedText = settings.saved.map((s) => `${s.label}: ${s.value}`).join('\n');

  const copySaved = async () => {
    try {
      await navigator.clipboard.writeText(savedText);
      showToast('Starred suggestions copied');
    } catch {
      showToast('Clipboard not available in this browser');
    }
  };

  const downloadSaved = () => {
    const blob = new Blob([savedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'starred-suggestions.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const activeIds = settings.activeCategories || DEFAULT_ACTIVE;

  return (
    <div className="stack">
      <div className="row row--tight">
        <button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={reroll}>
          <IconRefresh /> Reroll all
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={() => setSavedOpen(true)}
          aria-label="Starred suggestions"
        >
          {settings.saved.length ? <IconStarFilled width={17} height={17} /> : <IconStar />}
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={() => setSettingsOpen(true)}
          aria-label="Suggestion settings"
        >
          <IconGear />
        </button>
      </div>

      {settings.autoReroll ? (
        <div className="banner banner--good row row--tight">
          <IconClock width={16} height={16} />
          <span>Auto-reroll in {remaining}s</span>
          <div className="spacer" />
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => updateSuggestions({ autoReroll: false })}
          >
            Stop
          </button>
        </div>
      ) : null}

      <div className="sugg-grid">
        {active.map((category) => (
          <div className="sugg-card" key={category.categoryId}>
            <div className="row row--tight" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
              <div className="sugg-card__label" style={{ flex: 1 }}>{labelFor(category)}</div>
              <button
                type="button"
                className={`star-btn${isSaved(category) ? ' is-on' : ''}`}
                onClick={() => toggleSave(category)}
                aria-label={`Star ${labelFor(category)}`}
              >
                {isSaved(category) ? <IconStarFilled /> : <IconStar />}
              </button>
            </div>
            <button
              type="button"
              className="sugg-card__value is-swapping"
              key={`${category.categoryId}-${flashKey}-${settings.current[category.categoryId]}`}
              onClick={() => rerollOne(category)}
              style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', color: 'inherit' }}
              title="Tap to reroll just this one"
            >
              {settings.current[category.categoryId] || '…'}
            </button>
          </div>
        ))}
      </div>

      {active.length === 0 ? <Empty>No categories active. Open the gear to pick some.</Empty> : null}

      {settingsOpen ? (
        <Sheet
          title="Suggestion settings"
          subtitle={`${activeIds.length} of ${MAX_ACTIVE} category slots used`}
          onClose={() => setSettingsOpen(false)}
        >
          <div className="stack">
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Active categories</div>
              <div className="chip-row">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.categoryId}
                    type="button"
                    className={`chip${activeIds.includes(category.categoryId) ? ' is-active' : ''}`}
                    onClick={() => toggleCategory(category.categoryId)}
                  >
                    {labelFor(category)}
                  </button>
                ))}
              </div>
            </div>

            <div className="card card--flat">
              <Switch
                checked={settings.autoReroll}
                onChange={(on) => updateSuggestions({ autoReroll: on })}
                label="Auto-reroll"
                hint="Rerolls every active card on a timer."
              />
              <div className="divider" />
              <div className="label" style={{ marginBottom: 8 }}>Interval</div>
              <div className="chip-row">
                {INTERVALS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    className={`chip${settings.intervalSeconds === sec ? ' is-active' : ''}`}
                    onClick={() => updateSuggestions({ intervalSeconds: sec })}
                  >
                    {sec}s
                  </button>
                ))}
                <input
                  className="input"
                  style={{ width: 104, minHeight: 38, padding: '6px 10px' }}
                  type="number"
                  min="3"
                  max="3600"
                  placeholder="custom"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(e.target.value)}
                  onBlur={() => {
                    const value = Number(customInterval);
                    if (value >= 3) updateSuggestions({ intervalSeconds: Math.round(value) });
                    setCustomInterval('');
                  }}
                  aria-label="Custom interval in seconds"
                />
              </div>
              <div className="tiny faint" style={{ marginTop: 8 }}>
                Currently every {settings.intervalSeconds}s.
              </div>
            </div>
          </div>
        </Sheet>
      ) : null}

      {savedOpen ? (
        <Sheet
          title="Starred suggestions"
          subtitle={`${settings.saved.length} saved`}
          onClose={() => setSavedOpen(false)}
          footer={
            settings.saved.length ? (
              <div className="stack-sm">
                <div className="btn-grid">
                  <button type="button" className="btn btn--primary" onClick={copySaved}>
                    <IconCopy /> Copy as text
                  </button>
                  <button type="button" className="btn" onClick={downloadSaved}>
                    <IconDownload /> Download .txt
                  </button>
                </div>
                <ConfirmButton
                  className="btn btn--danger btn--block"
                  confirmLabel="Tap again to clear the list"
                  onConfirm={() => { updateSuggestions({ saved: [] }); showToast('Starred list cleared'); }}
                >
                  <IconTrash /> Clear list
                </ConfirmButton>
              </div>
            ) : null
          }
        >
          {settings.saved.length === 0 ? (
            <Empty>Nothing starred yet. Tap the star on a card to keep a combination.</Empty>
          ) : (
            <div className="stack-sm">
              {settings.saved.map((item, index) => (
                <Card className="card--flat" key={`${item.categoryId}-${item.value}-${index}`}>
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Tag tone="accent">{item.label}</Tag>
                      <div style={{ marginTop: 6, fontWeight: 600 }}>{item.value}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon"
                      aria-label="Remove"
                      onClick={() =>
                        updateSuggestions({ saved: settings.saved.filter((_, i) => i !== index) })}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Sheet>
      ) : null}
    </div>
  );
}
