import { BAND_COLOR, BAND_LABEL, SCORE_MAX, SCORE_MIN, scoreBand } from "@/lib/credit/model";
import { cn } from "@/lib/utils";

type ScoreRingProps = {
  score: number;
  hidden?: boolean;
  updatedLabel: string;
  className?: string;
};

export function ScoreRing({ score, hidden, updatedLabel, className }: ScoreRingProps) {
  const t = Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));
  const startDeg = 135;
  const angleDeg = startDeg + t * 360;
  const angleRad = (angleDeg * Math.PI) / 180;
  const size = 280;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const knobX = cx + Math.cos(angleRad) * radius;
  const knobY = cy + Math.sin(angleRad) * radius;
  const band = scoreBand(score);
  const fadeStop = `${Math.round(t * 100)}%`;

  return (
    <div className={cn("relative mx-auto", className)} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full" aria-hidden="true">
        <defs>
          <mask id="ring-mask">
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth={stroke}
            />
          </mask>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth={stroke}
        />
        <foreignObject x="0" y="0" width={size} height={size} mask="url(#ring-mask)">
          <div
            className="size-full"
            style={{
              background: hidden
                ? "var(--color-surface-2)"
                : `conic-gradient(from ${startDeg}deg, var(--color-gauge-mint) 0%, var(--color-gauge-yellow) 28%, var(--color-gauge-orange) 55%, var(--color-gauge-red) ${fadeStop}, var(--color-surface-2) ${fadeStop})`,
            }}
          />
        </foreignObject>
        {!hidden ? (
          <circle
            cx={knobX}
            cy={knobY}
            r={11}
            fill="var(--color-gauge-mint)"
            stroke="var(--color-bg)"
            strokeWidth={5}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p
          className="text-[56px] font-semibold leading-none tracking-tight tabular-nums text-fg"
          aria-label={hidden ? "Score hidden" : `Credit score ${score}`}
        >
          {hidden ? "•••" : score}
        </p>
        <p className="mt-2 text-sm text-muted">{hidden ? "Hidden" : updatedLabel}</p>
        {!hidden ? (
          <p
            className="mt-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: BAND_COLOR[band] }}
          >
            {BAND_LABEL[band]}
          </p>
        ) : null}
      </div>
    </div>
  );
}
