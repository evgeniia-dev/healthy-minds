import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MoodEntry {
  mood_score: number;
  sleep_hours: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
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

const factors = ["Mood", "Sleep", "Stress", "Exercise"];

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
      (e) => e.sleep_hours != null && e.stress_level != null && e.exercise_minutes != null
    );
    const vectors = [
      valid.map((e) => e.mood_score),
      valid.map((e) => e.sleep_hours!),
      valid.map((e) => e.stress_level!),
      valid.map((e) => e.exercise_minutes!),
    ];
    return factors.map((_, i) =>
      factors.map((_, j) => (i === j ? 1 : pearsonCorrelation(vectors[i], vectors[j])))
    );
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Matrix</CardTitle>
        <CardDescription>How your behavioral factors relate to each other. Positive values show factors improving together, while negative values show one factor worsening when another improves.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${factors.length}, 1fr)` }}>
          <div />
          {factors.map((f) => (
            <div key={f} className="text-center text-xs font-medium text-muted-foreground p-2">{f}</div>
          ))}
          {factors.map((row, i) => (
            <>
              <div key={`label-${row}`} className="flex items-center text-xs font-medium text-muted-foreground pr-2">{row}</div>
              {factors.map((col, j) => {
                const r = matrix[i][j];
                return (
                  <Tooltip key={`${row}-${col}`}>
                    <TooltipTrigger asChild>
                      <div className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium cursor-default ${getCorrelationColor(r)}`}>
                        {r.toFixed(2)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{row} ↔ {col}: {r.toFixed(3)}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
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
