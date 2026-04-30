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

const factors = [
  { full: "Mood", short: "Mood" },
  { full: "Sleep", short: "Sleep" },
  { full: "Stress", short: "Stress" },
  { full: "Exercise", short: "Ex." },
];

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;

  // Correlation needs enough complete entries to be meaningful.
  if (n < 3) {
    return 0;
  }

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const differenceX = x[i] - meanX;
    const differenceY = y[i] - meanY;

    numerator += differenceX * differenceY;
    denominatorX += differenceX * differenceX;
    denominatorY += differenceY * differenceY;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);

  // If one value never changes, the correlation cannot be calculated.
  return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationColor(correlation: number): string {
  if (correlation > 0.5) return "bg-emerald-500 text-white";
  if (correlation > 0.2) return "bg-emerald-300 text-foreground";
  if (correlation > -0.2) return "bg-muted text-muted-foreground";
  if (correlation > -0.5) return "bg-orange-300 text-foreground";

  return "bg-red-500 text-white";
}

export function CorrelationHeatmap({ entries }: { entries: MoodEntry[] }) {
  const validEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.sleep_hours != null &&
          entry.stress_level != null &&
          entry.exercise_minutes != null
      ),
    [entries]
  );

  const hasEnoughData = validEntries.length >= 3;

  const matrix = useMemo(() => {
    // Only complete entries are used so every factor has matching values.
    const vectors = [
      validEntries.map((entry) => entry.mood_score),
      validEntries.map((entry) => entry.sleep_hours!),
      validEntries.map((entry) => entry.stress_level!),
      validEntries.map((entry) => entry.exercise_minutes!),
    ];

    return factors.map((_, rowIndex) =>
      factors.map((_, columnIndex) =>
        rowIndex === columnIndex
          ? 1
          : pearsonCorrelation(vectors[rowIndex], vectors[columnIndex])
      )
    );
  }, [validEntries]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">
          Correlation Matrix
        </CardTitle>

        <CardDescription className="text-sm">
          This chart shows how mood, sleep, stress, and exercise are connected. 
          It shows patterns, such as better sleep appearing on the same days as a better mood, for example. 
          Positive values mean two things tend to improve together, while negative values mean when one improves, the other may worsen. 
          Please, note that the numbers are only a guide, and not diagnosis.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 overflow-x-auto px-3 sm:px-6">
        {!hasEnoughData ? (
          <p className="text-sm text-muted-foreground">
            Add at least 3 complete daily check-ins to see correlations.
          </p>
        ) : (
          <>
            <div
              className="grid min-w-[320px] gap-1"
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

              {factors.map((row, rowIndex) => (
                <div key={row.full} className="contents">
                  <div className="flex items-center text-[10px] font-medium text-muted-foreground sm:text-xs">
                    <span className="sm:hidden">{row.short}</span>
                    <span className="hidden sm:inline">{row.full}</span>
                  </div>

                  {factors.map((column, columnIndex) => {
                    const correlation = matrix[rowIndex][columnIndex];

                    return (
                      <Tooltip key={`${row.full}-${column.full}`}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex aspect-square items-center justify-center rounded-lg text-[11px] font-medium sm:text-xs ${getCorrelationColor(
                              correlation
                            )}`}
                          >
                            {correlation.toFixed(2)}
                          </div>
                        </TooltipTrigger>

                        <TooltipContent>
                          <p>
                            {row.full} ↔ {column.full}:{" "}
                            {correlation.toFixed(3)}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}