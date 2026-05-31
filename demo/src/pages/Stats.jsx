import { Doto, Mono, SectionLabel, StatCell, StatSep } from '../components/ui.jsx';
import { calendar, weeklyVolume, recent } from '../data/mockData.js';

const pad2 = (n) => String(n).padStart(2, '0');

export default function Stats() {
  const maxKg = Math.max(...weeklyVolume.map((w) => w.value));
  const lastWeek = weeklyVolume.at(-1).value;
  const prevWeek = weeklyVolume.at(-2).value;
  const delta = Math.round(((lastWeek - prevWeek) / prevWeek) * 100);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pt-2 pb-8">
      {/* KPI strip */}
      <div className="flex items-end py-3 border-y border-ink/15">
        <StatCell value="16" label="次数" />
        <StatSep />
        <StatCell value="28.5" label="容量(t)" />
        <StatSep />
        <StatCell value="07" label="连续(天)" />
      </div>

      {/* Calendar */}
      <div className="mt-6">
        <SectionLabel
          right={
            <Mono className="text-ink/55">← 4月 · 5月 · 6月 →</Mono>
          }
        >
          训练日历
        </SectionLabel>
        <div className="mt-3 border border-ink p-2">
          <div className="flex mb-1">
            <div className="w-7" />
            {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
              <div key={d} className="flex-1 text-center font-mono text-[10px] text-ink/55">
                {d}
              </div>
            ))}
          </div>
          {calendar.weeks.map((w) => (
            <div key={w.weekNum} className="flex mt-1 items-center">
              <div className="w-7 font-mono text-[9px] text-ink/55">W{w.weekNum}</div>
              {w.days.map((d, i) => (
                <div key={i} className="flex-1 flex justify-center">
                  {d ? (
                    <div
                      className={`w-7 h-7 border flex items-center justify-center ${
                        d.intensity === 3 ? 'bg-ink border-ink' :
                        d.intensity === 2 ? 'bg-ink/60 border-ink/60' :
                        d.intensity === 1 ? 'bg-ink/25 border-ink/25' :
                        'border-ink/15'
                      } ${d.isToday ? 'outline outline-2 outline-accent' : ''}`}
                    >
                      <span className={`font-mono text-[10px] ${d.intensity >= 2 ? 'text-bg' : 'text-ink'}`}>
                        {d.day}
                      </span>
                    </div>
                  ) : (
                    <div className="w-7 h-7" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly volume chart */}
      <div className="mt-6">
        <SectionLabel right={`Δ ${delta > 0 ? '+' : ''}${delta}%`}>
          周容量 (kg)
        </SectionLabel>
        <div className="mt-3 flex items-end h-28 border-b border-ink">
          {weeklyVolume.map((w) => {
            const h = Math.max(4, (w.value / maxKg) * 92);
            return (
              <div key={w.label} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end">
                  <div className="w-3.5 bg-ink" style={{ height: h }} />
                </div>
                <Mono className="text-ink/55 mt-1.5">{w.label}</Mono>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent */}
      <div className="mt-6">
        <SectionLabel>最近</SectionLabel>
        <div className="mt-2">
          {recent.map((r) => (
            <div
              key={`${r.dow}-${r.day}`}
              className="flex items-center py-3 gap-3 border-b border-ink/15"
            >
              <div className="font-bold text-[14px] w-16">{r.dow} {pad2(r.day)}</div>
              <div className="flex-1 text-ink/55 text-[13px]">
                {r.group} · {r.minutes} 分
              </div>
              <Mono>{r.tons}t</Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
