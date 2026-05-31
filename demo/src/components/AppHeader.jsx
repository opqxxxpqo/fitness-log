import { useLocation } from 'react-router-dom';

const TITLES = {
  '/overview': { kicker: 'DEMO', main: '设计概览' },
  '/today':    { kicker: '05.18', main: '周一' },
  '/work':     { kicker: '训练库', main: 'WORK' },
  '/stats':    { kicker: '数据', main: '五月 · 26' },
  '/me':       { kicker: '个人', main: '我' },
};

export default function AppHeader() {
  const { pathname } = useLocation();
  const { kicker, main } = TITLES[pathname] || TITLES['/overview'];

  return (
    <header className="flex justify-between items-start px-5 pt-4 pb-3">
      <div>
        <div className="font-mono text-[11px] text-ink/55 tracking-wide2 mb-1">
          // {kicker}
        </div>
        <h1 className="text-[22px] leading-none font-extrabold text-ink tracking-tightish">
          {main}
        </h1>
      </div>
      <div className="text-right font-mono text-[11px] text-ink/55 tracking-wide2">
        <div>第 21 周</div>
        <div>2026·05</div>
      </div>
    </header>
  );
}
