import { useState } from 'react';
import { useHashRoute, TABS } from './lib/hooks.js';
import { useApp } from './context/AppContext.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';
import UnlockSheet from './components/UnlockSheet.jsx';
import {
  IconAnvil, IconArchive, IconBook, IconBuilder, IconDice, IconGear, IconLayers,
} from './components/Icons.jsx';

import SessionBuilder from './tabs/SessionBuilder.jsx';
import Suggestions from './tabs/Suggestions.jsx';
import Formats from './tabs/Formats.jsx';
import Archive from './tabs/Archive.jsx';
import FormatForge from './tabs/FormatForge.jsx';
import Glossary from './tabs/Glossary.jsx';

const TAB_ICONS = {
  builder: IconBuilder,
  suggestions: IconDice,
  formats: IconLayers,
  archive: IconArchive,
  forge: IconAnvil,
  glossary: IconBook,
};

const TAB_VIEWS = {
  builder: SessionBuilder,
  suggestions: Suggestions,
  formats: Formats,
  archive: Archive,
  forge: FormatForge,
  glossary: Glossary,
};

export default function App() {
  const { route, navigate } = useHashRoute();
  const { toast, unlockPending, cancelUnlock, completeUnlock } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subtitle, setSubtitle] = useState('');

  const active = TABS.find((t) => t.id === route.tab) || TABS[0];
  const View = TAB_VIEWS[active.id];

  return (
    <div className="app">
      <header className="appbar">
        <div className="appbar__titles">
          <div className="appbar__title">{active.title}</div>
          {subtitle ? <div className="appbar__sub">{subtitle}</div> : null}
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--icon"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          <IconGear />
        </button>
      </header>

      <main className="screen">
        <View route={route} navigate={navigate} setSubtitle={setSubtitle} />
      </main>

      <nav className="tabbar" aria-label="Main">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tabbar__btn${isActive ? ' is-active' : ''}`}
              onClick={() => navigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {settingsOpen ? <SettingsSheet onClose={() => setSettingsOpen(false)} /> : null}
      {unlockPending ? <UnlockSheet onClose={cancelUnlock} onUnlocked={completeUnlock} /> : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}
