import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/overview', label: 'INFO' },
  { to: '/today', label: 'TODAY' },
  { to: '/work', label: 'WORK' },
  { to: '/stats', label: 'STATS' },
  { to: '/me', label: 'ME' },
];

export default function BottomNav() {
  return (
    <nav className="flex border-t border-ink bg-bg">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className="flex-1 flex flex-col items-center gap-1 pt-1 pb-2 hover:bg-ink/[0.04] transition-colors"
        >
          {({ isActive }) => (
            <>
              <span
                className={`h-[2px] w-8 ${
                  isActive ? 'bg-accent' : 'bg-transparent'
                }`}
              />
              <span
                className={`font-mono text-[11px] tracking-wide3 ${
                  isActive ? 'text-ink font-bold' : 'text-ink/55'
                }`}
              >
                {t.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
