import { Card, CTA, Doto, Mono, SectionLabel, Tag, StatCell, StatSep } from '../components/ui.jsx';
import { library } from '../data/mockData.js';

const pad2 = (n) => String(n).padStart(2, '0');
const setsOf = (t) => Number(String(t).match(/(\d+)\s*[×xX*]/)?.[1] || 0);

export default function Work() {
  const groups = [...new Set(library.map((l) => l.group))];
  const totalSets = library.reduce((a, l) => a + setsOf(l.target), 0);

  const grouped = new Map();
  library.forEach((ex) => {
    if (!grouped.has(ex.group)) grouped.set(ex.group, []);
    grouped.get(ex.group).push(ex);
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Card className="mx-5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <Mono className="text-ink/55 block mb-1">训练库</Mono>
            <h2 className="text-[26px] leading-[1.1] font-extrabold tracking-tightish">我的项目</h2>
          </div>
          <div className="border border-ink px-2.5 py-1.5 min-w-[48px] flex flex-col items-center">
            <span className="font-mono text-[13px] font-bold tracking-wide2">LIB</span>
            <Mono className="text-ink/55 mt-0.5">{pad2(library.length)}</Mono>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {groups.map((g) => <Tag key={g}>{g}</Tag>)}
        </div>

        <div className="flex items-end mt-4 pt-3 border-t border-ink/15">
          <StatCell value={pad2(library.length)} label="项目" />
          <StatSep />
          <StatCell value={pad2(totalSets)} label="总组数" />
          <StatSep />
          <StatCell value={pad2(groups.length)} label="部位" />
        </div>
      </Card>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5">
        {[...grouped.entries()].map(([gname, items], gi) => (
          <div key={gname} className={gi === 0 ? 'mt-4' : 'mt-5'}>
            <SectionLabel right={pad2(items.length)}>{gname}</SectionLabel>
            <div className="mt-2">
              {items.map((ex, i) => (
                <button
                  key={ex.id}
                  className="w-full flex items-center py-3.5 gap-2 border-b border-ink/15 text-left hover:bg-ink/[0.04] transition-colors"
                >
                  <Mono className="w-8 text-ink/55">{pad2(i + 1)}</Mono>
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-semibold text-[16px] tracking-tightish truncate">{ex.name}</div>
                    <Mono className="text-ink/55 block mt-0.5">
                      {ex.target}&nbsp;&nbsp;·&nbsp;&nbsp;休 {ex.rest}s
                    </Mono>
                  </div>
                  <span className="border border-ink min-w-[64px] text-center px-3 py-1.5 font-mono text-[13px] tracking-wide2">
                    编辑
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="h-4" />
      </div>

      <div className="px-5 pt-2 pb-2 border-t border-ink/15 bg-bg">
        <CTA accent>+&nbsp;&nbsp;新增项目 &nbsp;▸</CTA>
      </div>
    </div>
  );
}
