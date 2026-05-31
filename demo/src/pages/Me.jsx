import { Doto, Mono, SectionLabel } from '../components/ui.jsx';
import { profile } from '../data/mockData.js';

const pad2 = (n) => String(n).padStart(2, '0');
const pad3 = (n) => String(n).padStart(3, '0');

export default function Me() {
  const t = profile.totals;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pt-2 pb-8">
      {/* User card */}
      <div className="flex items-center py-5 gap-4 border-y border-ink/15">
        <div className="relative">
          <div className="w-16 h-16 bg-ink text-bg flex items-center justify-center text-[26px] font-extrabold">
            {profile.name.slice(0, 1)}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-accent text-bg px-1.5 py-px font-mono text-[9px] tracking-wide2">
            LV.{profile.level}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-extrabold tracking-tightish">{profile.name}</h2>
          <Mono className="text-ink/55 block mt-1">会员 · {profile.joinedDays} 天</Mono>
          <Mono className="text-ink/55 block">目标 · {profile.goal}</Mono>
        </div>
      </div>

      {/* Totals grid */}
      <div className="mt-5">
        <SectionLabel>累计</SectionLabel>
        <div className="grid grid-cols-2 mt-3 border-t border-ink/15">
          <Total label="总训练次数" value={pad3(t.sessions)} />
          <Total label="总时长 (h)" value={pad3(t.hours)} />
          <Total label="百万 kg" value={(t.kg / 1e6).toFixed(2)} />
          <Total label="历史 PR" value={pad2(t.prs)} />
        </div>
      </div>

      {/* Goals */}
      <div className="mt-5">
        <SectionLabel>目标</SectionLabel>
        <div className="mt-2">
          {profile.goals.map((g) => (
            <div key={g.id} className="mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[14px]">{g.label}</span>
                <Mono>{g.pct}%</Mono>
              </div>
              <ProgressBar pct={g.pct} />
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="mt-6">
        <SettingRow label="器械" value="已存 5" />
        <SettingRow label="单位" value="kg · cm" />
        <SettingRow label="同步" value="Healthkit" />
        <SettingRow label="清空数据" danger />
      </div>
    </div>
  );
}

function Total({ label, value }) {
  return (
    <div className="py-3 px-2 border-b border-ink/15">
      <Doto size={26}>{value}</Doto>
      <Mono className="text-ink/55 block mt-1">{label}</Mono>
    </div>
  );
}

function ProgressBar({ pct }) {
  const cells = 26;
  const filled = Math.round((pct / 100) * cells);
  return (
    <div className="flex gap-0.5 mt-1.5">
      {Array.from({ length: cells }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-2 border ${
            i < filled ? 'bg-ink border-ink' : 'border-ink/15'
          }`}
        />
      ))}
    </div>
  );
}

function SettingRow({ label, value, danger }) {
  return (
    <button className="w-full flex justify-between items-center py-3 border-b border-ink/15 text-left hover:bg-ink/[0.04] transition-colors">
      <span className={`font-medium text-[15px] ${danger ? 'text-accent' : ''}`}>
        {label}
      </span>
      <span className="flex items-center gap-2">
        {value && <Mono className="text-ink/55">{value}</Mono>}
        <span className="text-ink/55 text-lg">›</span>
      </span>
    </button>
  );
}
