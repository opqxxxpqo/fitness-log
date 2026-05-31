import { useNavigate } from 'react-router-dom';
import { Card, CTA, Doto, Mono, SectionLabel, Tag, StatCell, StatSep } from '../components/ui.jsx';
import { library, todayDoneIds } from '../data/mockData.js';

const pad2 = (n) => String(n).padStart(2, '0');
const setsOf = (t) => Number(String(t).match(/(\d+)\s*[×xX*]/)?.[1] || 0);

export default function Today() {
  const nav = useNavigate();
  const totalSets = library.reduce((a, l) => a + setsOf(l.target), 0);
  const minutes = totalSets * 2;
  const groups = [...new Set(library.map((l) => l.group))];
  const doneIds = new Set(todayDoneIds);
  const nextIdx = library.findIndex((l) => !doneIds.has(l.id));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Fixed title card */}
      <Card className="mx-5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <Mono className="text-ink/55 block mb-1">今日训练</Mono>
            <h2 className="text-[26px] leading-[1.1] font-extrabold tracking-tightish">推 训练日</h2>
          </div>
          <div className="border border-ink px-2.5 py-1.5 min-w-[48px] flex flex-col items-center">
            <span className="font-mono text-[13px] font-bold tracking-wide2">推</span>
            <Mono className="text-ink/55 mt-0.5">训练日</Mono>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {groups.map((g) => <Tag key={g}>{g}</Tag>)}
        </div>

        <div className="flex items-end mt-4 pt-3 border-t border-ink/15">
          <StatCell value={pad2(library.length)} label="项目" />
          <StatSep />
          <StatCell value={pad2(totalSets)} label="组数" />
          <StatSep />
          <StatCell value={pad2(minutes)} label="分钟" />
        </div>
      </Card>

      {/* Scrollable plan list */}
      <div className="flex-1 min-h-0 flex flex-col px-5 pt-5">
        <SectionLabel right={`${pad2(0)} / ${pad2(library.length)}`}>计划</SectionLabel>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pt-2 pb-2">
          {library.map((ex, idx) => {
            const isNext = idx === nextIdx;
            const isDone = doneIds.has(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => nav('/workout')}
                className="w-full flex items-center py-3.5 gap-2 border-b border-ink/15 text-left hover:bg-ink/[0.04] transition-colors"
              >
                <Mono className="w-8 text-ink/55">{pad2(idx + 1)}</Mono>
                <div className="flex-1 min-w-0 mr-2">
                  <div className={`font-semibold text-[16px] tracking-tightish truncate ${isDone ? 'line-through text-ink/35' : ''}`}>
                    {ex.name}
                  </div>
                  <Mono className="text-ink/55 block mt-0.5">{ex.target}</Mono>
                </div>
                <span
                  className={`border min-w-[64px] text-center px-3 py-1.5 font-mono text-[13px] tracking-wide2 ${
                    isNext
                      ? 'bg-accent border-accent text-bg'
                      : isDone
                      ? 'border-ink/15 text-ink/35'
                      : 'border-ink text-ink'
                  }`}
                >
                  {isDone ? '✓' : isNext ? '开始' : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned CTA */}
      <div className="px-5 pt-2 pb-2 border-t border-ink/15 bg-bg">
        <CTA accent onClick={() => nav('/workout')}>开始训练 &nbsp;▸</CTA>
      </div>
    </div>
  );
}
