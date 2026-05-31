// Shared UI primitives that mirror the React Native components in src/.
// Tailwind utility classes carry the design tokens; logic is kept thin.

export function SectionLabel({ children, right }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-[11px] text-ink/55 tracking-wide2">
        // {children}
      </span>
      {right != null &&
        (typeof right === 'string' ? (
          <span className="font-mono text-[11px] text-ink/55 tracking-wide2">{right}</span>
        ) : (
          right
        ))}
    </div>
  );
}

export function Tag({ children, active = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center border ${
        active ? 'bg-ink text-bg border-ink' : 'border-ink text-ink'
      } px-2.5 py-[3px] font-mono text-[11px] tracking-wide2 ${className}`}
    >
      {children}
    </span>
  );
}

export function Doto({ children, size = 44, className = '' }) {
  return (
    <span
      className={`font-doto font-bold leading-none text-ink ${className} tab-num`}
      style={{ fontSize: size, letterSpacing: '-0.02em' }}
    >
      {children}
    </span>
  );
}

export function Mono({ children, className = '' }) {
  return (
    <span className={`font-mono text-[11px] tracking-wide2 ${className}`}>
      {children}
    </span>
  );
}

export function StatCell({ value, label }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      <Doto size={44}>{value}</Doto>
      <span className="font-mono text-[11px] text-ink/55 mt-1 tracking-wide2">
        {label}
      </span>
    </div>
  );
}

export function StatSep() {
  return <div className="w-px h-12 bg-ink/15" />;
}

export function CTA({ children, accent = false, onClick, className = '' }) {
  const base =
    'block w-full text-center border font-mono text-[14px] tracking-wide2 py-4 transition-colors';
  const palette = accent
    ? 'bg-ink text-bg border-ink hover:bg-accent hover:border-accent'
    : 'bg-bg text-ink border-ink hover:bg-ink/[0.04]';
  return (
    <button onClick={onClick} className={`${base} ${palette} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-bg border border-ink p-4 ${className}`}>{children}</div>
  );
}

// Title card used at the top of TODAY / WORK / STATS / ME
export function TitleCard({ kicker, title, tagTop, tagBot, chips = [], stats = [] }) {
  return (
    <Card className="mx-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[11px] text-ink/55 tracking-wide2 mb-1">
            {kicker}
          </div>
          <h2 className="text-[26px] leading-[1.1] font-extrabold text-ink tracking-tightish">
            {title}
          </h2>
        </div>
        {(tagTop || tagBot) && (
          <div className="border border-ink px-2.5 py-1.5 min-w-[48px] flex flex-col items-center">
            <span className="font-mono text-[13px] font-bold text-ink tracking-wide2">
              {tagTop}
            </span>
            <span className="font-mono text-[9px] text-ink/55 tracking-wide3 mt-px">
              {tagBot}
            </span>
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {chips.map((c) => (
            <Tag key={c}>{c}</Tag>
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <div className="flex items-end mt-4 pt-3 border-t border-ink/15">
          {stats.flatMap((st, i) =>
            i === 0
              ? [<StatCell key={st.label} value={st.value} label={st.label} />]
              : [
                  <StatSep key={`sep-${i}`} />,
                  <StatCell key={st.label} value={st.value} label={st.label} />,
                ]
          )}
        </div>
      )}
    </Card>
  );
}
