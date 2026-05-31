import { Link } from 'react-router-dom';
import { Doto, Mono, SectionLabel, Tag } from '../components/ui.jsx';

const ROUTES = [
  { to: '/today',   label: 'TODAY',   sub: '今日训练 · 项目清单 · CTA',         tag: 'ACN1' },
  { to: '/work',    label: 'WORK',    sub: '训练库管理 · 按部位分组',            tag: 'NEW' },
  { to: '/workout', label: 'WORKOUT', sub: '训练中 · 计时 · 组数 · 休息',       tag: 'ACN2' },
  { to: '/stats',   label: 'STATS',   sub: '日历 · 周容量 · 最近',              tag: 'ACN3' },
  { to: '/me',      label: 'ME',      sub: '档案 · 累计 · 目标 · 设置',         tag: 'ACN4' },
];

const TOKENS = [
  { name: 'bg',      hex: '#F2F0EC', note: '暖纸主背景' },
  { name: 'surface', hex: '#E7E4DE', note: '次表面' },
  { name: 'ink',     hex: '#0A0A0A', note: '主文字' },
  { name: 'accent',  hex: '#FF3B1F', note: '强调红橙' },
];

export default function Overview() {
  return (
    <div className="px-5 pt-2 pb-8">
      {/* Hero */}
      <section className="border border-ink p-5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <Mono className="text-ink/55">// fitness-log v2</Mono>
            <h2 className="text-[28px] leading-[1.05] font-extrabold mt-2 tracking-tightish">
              像素瑞士风<br />健身记录 demo
            </h2>
            <p className="text-[13px] text-ink/55 mt-3 leading-relaxed">
              本地无网 / 单人使用 / Expo + RN 原生 + Web 双形态。
              4 个屏完整复刻 ACN 设计稿。
            </p>
          </div>
          <div className="border border-ink px-2 py-1.5 text-center min-w-[52px]">
            <Doto size={20}>v2</Doto>
            <Mono className="text-ink/55 block mt-0.5">2026·05</Mono>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          <Tag>RN 0.81</Tag>
          <Tag>Expo SDK 54</Tag>
          <Tag>AsyncStorage</Tag>
          <Tag>Vite Demo</Tag>
        </div>
      </section>

      {/* Routes */}
      <div className="mt-8">
        <SectionLabel right={`${ROUTES.length} 屏`}>页面</SectionLabel>
        <div className="mt-3">
          {ROUTES.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="flex items-center py-3.5 gap-3 border-b border-ink/15 hover:bg-ink/[0.04] -mx-5 px-5 transition-colors"
            >
              <Mono className="w-12 text-ink/55">{r.tag}</Mono>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] tracking-tightish">{r.label}</div>
                <div className="font-mono text-[11px] text-ink/55 tracking-wide2 mt-0.5">
                  {r.sub}
                </div>
              </div>
              <span className="text-ink/55 text-lg">›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tokens */}
      <div className="mt-8">
        <SectionLabel>色板</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {TOKENS.map((t) => (
            <div key={t.name} className="border border-ink/15 p-2.5 flex items-center gap-3">
              <span
                className="w-10 h-10 border border-ink/20"
                style={{ background: t.hex }}
              />
              <div className="flex-1 min-w-0">
                <Mono className="block text-ink">{t.name}</Mono>
                <Mono className="block text-ink/55">{t.hex}</Mono>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="mt-8">
        <SectionLabel>字体</SectionLabel>
        <div className="mt-3 space-y-2.5">
          <Specimen family="Doto" sample="44 80 1.42" desc="像素数字 KPI" cls="font-doto text-[28px]" />
          <Specimen family="JetBrains Mono" sample="// 计划 · PRESET 1:30" desc="终端注释 · 标签" cls="font-mono text-[13px]" />
          <Specimen family="Noto Sans SC" sample="推 训练日" desc="中文标题 / 正文" cls="font-sans text-[22px] font-extrabold" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pb-2 text-center">
        <Mono className="text-ink/35">// end · made with claude code + impeccable</Mono>
      </div>
    </div>
  );
}

function Specimen({ family, sample, desc, cls }) {
  return (
    <div className="border border-ink/15 p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className={`${cls} tab-num truncate`}>{sample}</div>
        <Mono className="block text-ink/55 mt-1">{family} · {desc}</Mono>
      </div>
    </div>
  );
}
