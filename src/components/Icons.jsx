/* Inline SVG icons: no icon library, so nothing extra to load on a phone. */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const make = (children) => function Icon(props) {
  return <svg {...base} {...props}>{children}</svg>;
};

/* tabs */
export const IconBuilder = make(<><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M8 2.5v3M16 2.5v3M3 9.5h18M8 14h5M8 17.5h8" /></>);
export const IconDice = make(<><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" /></>);
export const IconLayers = make(<><path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" /><path d="m3 12.5 9 4.5 9-4.5" /><path d="m3 17 9 4.5 9-4.5" /></>);
export const IconArchive = make(<><rect x="3" y="3.5" width="18" height="5" rx="1.6" /><path d="M5 8.5v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10" /><path d="M9.5 12.5h5" /></>);
export const IconAnvil = make(<><path d="M4 7h9l2.5 3H21a4.5 4.5 0 0 1-4.5 4.5H9L7 11H4a3 3 0 0 1 0-4Z" /><path d="M9 14.5 7.5 20M15 14.5 16.5 20M5.5 20.5h13" /></>);
export const IconBook = make(<><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v4H6.5A2.5 2.5 0 0 1 4 19.5" /></>);

/* actions */
export const IconGear = make(<><circle cx="12" cy="12" r="3.2" /><path d="M19.4 14.5a1.6 1.6 0 0 0 .33 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.33 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.11a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .33-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.11a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.33-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.33H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.11a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.33 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.11a1.6 1.6 0 0 0-1.47 1Z" /></>);
export const IconSun = make(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const IconMoon = make(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />);
export const IconStar = make(<path d="m12 3.5 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.9l6-.9L12 3.5Z" />);
export const IconStarFilled = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="m12 3.5 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.9l6-.9L12 3.5Z" />
  </svg>
);
export const IconCheck = make(<path d="m4.5 12.5 5 5 10-11" />);
export const IconPlus = make(<path d="M12 5v14M5 12h14" />);
export const IconMinus = make(<path d="M5 12h14" />);
export const IconTrash = make(<><path d="M4 7h16M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" /><path d="M6 7v12.5A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7" /><path d="M10 11v6M14 11v6" /></>);
export const IconPlay = make(<path d="M7 4.5 19 12 7 19.5Z" />);
export const IconPause = make(<><path d="M8.5 5v14M15.5 5v14" /></>);
export const IconReset = make(<><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" /><path d="M3 4v5h5" /></>);
export const IconDownload = make(<><path d="M12 3.5v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4.5 20.5h15" /></>);
export const IconUpload = make(<><path d="M12 20.5v-11" /><path d="m7.5 13.5 4.5-4.5 4.5 4.5" /><path d="M4.5 3.5h15" /></>);
export const IconSearch = make(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>);
export const IconClose = make(<path d="M6 6l12 12M18 6 6 18" />);
export const IconChevron = make(<path d="m9 5 7 7-7 7" />);
export const IconArrowUp = make(<path d="M12 20V5m0 0-6 6m6-6 6 6" />);
export const IconArrowDown = make(<path d="M12 4v15m0 0 6-6m-6 6-6-6" />);
export const IconCopy = make(<><rect x="8.5" y="8.5" width="12" height="12" rx="2.5" /><path d="M15.5 5.5A2 2 0 0 0 13.5 3.5h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2" /></>);
export const IconEdit = make(<><path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17Z" /><path d="m14.5 6.5 3 3" /></>);
export const IconClock = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.3 2" /></>);
export const IconNotes = make(<><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><path d="M8 8.5h8M8 12.5h8M8 16.5h5" /></>);
export const IconSend = make(<><path d="M4 12h13" /><path d="m12 6.5 5.5 5.5L12 17.5" /><path d="M20.5 4v16" /></>);
export const IconBack = make(<path d="m14.5 5-7 7 7 7" />);
export const IconRefresh = make(<><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" /><path d="M21 4v5h-5" /></>);
export const IconFilter = make(<path d="M3.5 5.5h17l-6.5 8v6l-4 2v-8Z" />);
