import { useNavigate } from 'react-router-dom';
import { Doto, Mono, SectionLabel } from '../components/ui.jsx';
import { library, workoutSession } from '../data/mockData.js';

const pad2 = (n) => String(n).padStart(2, '0');
const clock = (s) => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;

const REST_PRESETS = [60, 90, 120, 180, 300];

export default function Workout() {
  const nav = useNavigate();
  const session = workoutSession;
  const current = library[session.exerciseIndex];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Top bar */}
      <div className="flex justify-between items-center px-5 pt-3 pb-3">
        <button onClick={() => nav(-1)} className="font-mono text-[13px]">
          ✕
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent inline-block" />
          <Mono>进行中 · {session.elapsed}</Mono>
        </div>
        <button className="border border-ink px-3 py-1 font-mono text-[11px]">
          暂停
        </button>
      </div>
      <div className="h-px bg-ink/15" />

      {/* Exercise nav */}
      <div className="flex items-center px-3 py-4">
        <button className="p-3 text-xl">◀</button>
        <div className="flex-1 text-center">
          <Mono className="text-ink/55 block mb-0.5">
            项目 {pad2(session.exerciseIndex + 1)} / {pad2(session.totalExercises)}
          </Mono>
          <div className="text-[22px] font-extrabold tracking-tightish">{current.name}</div>
        </div>
        <button className="p-3 text-xl">▶</button>
      </div>

      {/* Set dots */}
      <div className="flex justify-center gap-1.5 mb-3">
        {Array.from({ length: session.totalSets }).map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 border ${
              i < session.setIndex ? 'bg-ink border-ink' :
              i === session.setIndex ? 'border-accent' :
              'border-ink'
            }`}
          />
        ))}
      </div>

      <div className="h-px bg-ink/15" />

      {/* Big inputs */}
      <div className="flex border-b border-ink/15">
        <BigField label="重量" value="80" unit="kg" />
        <div className="w-px bg-ink/15" />
        <BigField label="次数" value="08" />
      </div>

      {/* Set indicator + PR */}
      <div className="flex justify-between items-center px-5 pt-3">
        <Mono>第 {pad2(session.setIndex + 1)} / {pad2(session.totalSets)} 组</Mono>
        <Mono className="text-ink/55">PR · {current.pr}kg</Mono>
      </div>

      {/* Quick set row */}
      <div className="flex gap-1.5 px-5 pt-2">
        {Array.from({ length: session.totalSets }).map((_, i) => {
          const isDone = i < session.setIndex;
          const isCurrent = i === session.setIndex;
          return (
            <div
              key={i}
              className={`flex-1 h-9 border flex items-center justify-center font-mono text-[11px] ${
                isDone ? 'bg-ink border-ink text-bg' :
                isCurrent ? 'border-accent text-accent' :
                'border-ink/15 text-ink/55'
              }`}
            >
              {isDone ? '✓' : isCurrent ? '本组' : pad2(i + 1)}
            </div>
          );
        })}
      </div>

      <div className="h-px bg-ink/15 mt-4" />

      {/* Rest timer */}
      <div className="px-5 pt-4">
        <div className="flex justify-between">
          <Mono>// 组间休息</Mono>
          <Mono className="text-ink/55">PRESET · {clock(session.rest.preset)}</Mono>
        </div>
        <div className="flex items-center mt-2">
          <Doto size={44} className="flex-1">{clock(session.rest.remaining)}</Doto>
          <button className="border border-ink px-4 py-2 font-mono text-[11px]">开始</button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {REST_PRESETS.map((sec) => (
            <button
              key={sec}
              className={`border px-2.5 py-1.5 font-mono text-[11px] ${
                sec === session.rest.preset
                  ? 'bg-ink border-ink text-bg'
                  : 'border-ink text-ink'
              }`}
            >
              {clock(sec)}
            </button>
          ))}
          <button className="border border-ink px-2.5 py-1.5 font-mono text-[14px]">+</button>
        </div>

        <div className="flex items-center mt-3 pt-3 border-t border-ink/15">
          <Mono>自定义</Mono>
          <div className="flex items-center gap-1 ml-auto">
            <Mono className="text-ink/55">分</Mono>
            <span className="border border-ink w-9 text-center font-mono text-[13px]">02</span>
            <Mono className="text-ink/55">秒</Mono>
            <span className="border border-ink w-9 text-center font-mono text-[13px]">30</span>
            <button className="border border-ink px-2 py-1 font-mono text-[11px] ml-1">应用 ▸</button>
          </div>
        </div>
      </div>

      <div className="h-px bg-ink/15 mt-4" />

      {/* Done log */}
      <div className="px-5 pt-4">
        <SectionLabel>已完成</SectionLabel>
        <div className="mt-2">
          {session.completed.map((set, i) => (
            <div key={i} className="flex items-center py-1.5 gap-2 border-b border-ink/15 font-mono text-[12px]">
              <span className="w-8">{pad2(i + 1)}</span>
              <span className="w-16">{set.weight} kg</span>
              <span className="w-14">{set.reps} 次</span>
              {set.isPR && <span className="text-accent">PR</span>}
              <span className="ml-auto text-[14px]">✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom action row */}
      <div className="flex gap-3 px-5 pt-5 pb-5 mt-auto">
        <button className="border border-ink px-4 py-3 font-mono text-[11px]">+ 备注</button>
        <button className="flex-1 bg-ink text-bg border border-ink py-3 font-mono text-[13px] tracking-wide2">
          记录本组 &nbsp;▸
        </button>
      </div>
    </div>
  );
}

function BigField({ label, value, unit }) {
  return (
    <div className="flex-1 px-4 py-3">
      <Mono className="text-ink/55">// {label}</Mono>
      <div className="flex items-end mt-1">
        <Doto size={44}>{value}</Doto>
        {unit && <Mono className="ml-1 mb-2 text-ink/55">{unit}</Mono>}
      </div>
    </div>
  );
}
