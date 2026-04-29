import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoodEntry {
  mood_score: number;
  sleep_hours: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;

  if (n < 3) {
    return 0;
  }

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;

    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);

  return den === 0 ? 0 : num / den;
}

const factors = [
  { full: "Mood", short: "Mood" },
  { full: "Sleep", short: "Sleep" },
  { full: "Stress", short: "Stress" },
  { full: "Exercise", short: "Ex." },
];

function getCorrelationColor(r: number): string {
  if (r > 0.5) return "bg-emerald-500 text-white";
  if (r > 0.2) return "bg-emerald-300 text-foreground";
  if (r > -0.2) return "bg-muted text-muted-foreground";
  if (r > -0.5) return "bg-orange-300 text-foreground";

  return "bg-red-500 text-white";
}

export function CorrelationHeatmap({ entries }: { entries: MoodEntry[] }) {
  const matrix = useMemo(() => {
    const valid = entries.filter(
      (entry) =>
        entry.sleep_hours != null &&
        entry.stress_level != null &&
        entry.exercise_minutes != null
    );

    const vectors = [
      valid.map((entry) => entry.mood_score),
      valid.map((entry) => entry.sleep_hours!),
      valid.map((entry) => entry.stress_level!),
      valid.map((entry) => entry.exercise_minutes!),
    ];

    return factors.map((_, i) =>
      factors.map((_, j) =>
        i === j ? 1 : pearsonCorrelation(vectors[i], vectors[j])
      )
    );
  }, [entries]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">
          Correlation Matrix
        </CardTitle>

        <CardDescription className="text-sm">
          How your mood, sleep, stress, and exercise patterns relate to each
          other
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-3 sm:px-6">
        <div
          className="grid w-full gap-1"
          style={{
            gridTemplateColumns: "46px repeat(4, minmax(0, 1fr))",
          }}
        >
          <div />

          {factors.map((factor) => (
            <div
              key={factor.full}
              className="flex items-center justify-center text-center text-[10px] font-medium text-muted-foreground sm:text-xs"
            >
              <span className="sm:hidden">{factor.short}</span>
              <span className="hidden sm:inline">{factor.full}</span>
            </div>
          ))}

          {factors.map((row, i) => (
            <div key={row.full} className="contents">
              <div className="flex items-center text-[10px] font-medium text-muted-foreground sm:text-xs">
                <span className="sm:hidden">{row.short}</span>
                <span className="hidden sm:inline">{row.full}</span>
              </div>

              {factors.map((col, j) => {
                const r = matrix[i][j];

                return (
                  <Tooltip key={`${row.full}-${col.full}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex aspect-square items-center justify-center rounded-lg text-[11px] font-medium sm:text-xs ${getCorrelationColor(
                          r
                        )}`}
                      >
                        {r.toFixed(2)}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>
                        {row.full} ↔ {col.full}: {r.toFixed(3)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
          <span>Strong −</span>
          <div className="h-3 w-3 rounded-sm bg-red-500" />
          <div className="h-3 w-3 rounded-sm bg-orange-300" />
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-emerald-300" />
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span>Strong +</span>
        </div>
      </CardContent>
    </Card>
  );
}