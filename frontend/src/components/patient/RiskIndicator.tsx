import { useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MoodEntry {
  mood_score: number;
  stress_level: number | null;
  sleep_hours: number | null;
}

interface HealthData {
  indicator_name: string;
  value: number | null;
  year?: number;
}

type ComparisonStatus = "better" | "worse" | "similar";

type Comparison = {
  label: string;
  userValue: string;
  populationValue: string;
  status: ComparisonStatus;
};

function userStressToPercent(avgStress: number): number {
  // Converts the user's 1-10 stress scale into a simple percentage-like value.
  return Math.min(100, Math.max(0, (avgStress / 10) * 100));
}

function userLowMoodToPercent(avgMood: number): number {
  // Higher mood is better, so this reverses mood into a low-wellbeing indicator.
  return Math.min(100, Math.max(0, ((10 - avgMood) / 10) * 100));
}

function getLatestIndicator(populationData: HealthData[], keyword: string) {
  // Finds the newest available population indicator matching the given keyword.
  const matches = populationData
    .filter(
      (item) =>
        item.indicator_name.toLowerCase().includes(keyword) &&
        item.value != null
    )
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return matches.length > 0 ? matches[0].value! : null;
}

function getComparisonStatus(
  userValue: number,
  populationValue: number
): ComparisonStatus {
  // Compares user value with population value using a soft margin.
  if (userValue > populationValue * 1.3) return "worse";
  if (userValue < populationValue * 0.7) return "better";
  return "similar";
}

export function RiskIndicator({
  entries,
  populationData,
}: {
  entries: MoodEntry[];
  populationData: HealthData[];
}) {
  const analysis = useMemo(() => {
    // Risk assessment needs enough data to avoid overreacting to one or two days.
    if (entries.length < 7) {
      return {
        label: "Not enough data",
        description:
          "Add at least 7 daily check-ins before showing a wellbeing pattern summary.",
        color: "text-muted-foreground",
        icon: AlertCircle,
        comparisons: [] as Comparison[],
        score: 0,
      };
    }

    // Uses the latest 30 entries so older data does not dominate current patterns.
    const recentEntries = entries.slice(-30);

    const avgMood =
      recentEntries.reduce((sum, entry) => sum + entry.mood_score, 0) /
      recentEntries.length;

    const stressEntries = recentEntries.filter(
      (entry) => entry.stress_level != null
    );

    const avgStress =
      stressEntries.length > 0
        ? stressEntries.reduce(
            (sum, entry) => sum + (entry.stress_level ?? 0),
            0
          ) / stressEntries.length
        : null;

    const sleepEntries = recentEntries.filter(
      (entry) => entry.sleep_hours != null
    );

    const avgSleep =
      sleepEntries.length > 0
        ? sleepEntries.reduce(
            (sum, entry) => sum + (entry.sleep_hours ?? 0),
            0
          ) / sleepEntries.length
        : null;

    const populationStrain = getLatestIndicator(
      populationData,
      "severe mental strain"
    );

    const populationInsomnia = getLatestIndicator(
      populationData,
      "anxiety or insomnia"
    );

    const comparisons: Comparison[] = [];
    let score = 0;

    // Mood comparison: lower mood is treated as a possible strain signal.
    if (populationStrain != null) {
      const userLowMoodPercent = userLowMoodToPercent(avgMood);
      const status = getComparisonStatus(
        userLowMoodPercent,
        populationStrain
      );

      comparisons.push({
        label: "Mood pattern",
        userValue: `${avgMood.toFixed(1)}/10 avg`,
        populationValue: `${populationStrain.toFixed(1)}% report severe strain`,
        status,
      });

      if (status === "worse") score += 3;
      if (status === "similar") score += 1;
    }

    // Stress comparison: higher stress increases the risk score.
    if (avgStress != null && populationStrain != null) {
      const userStressPercent = userStressToPercent(avgStress);
      const status = getComparisonStatus(userStressPercent, populationStrain);

      comparisons.push({
        label: "Stress pattern",
        userValue: `${avgStress.toFixed(1)}/10 avg`,
        populationValue: `${populationStrain.toFixed(1)}% report severe strain`,
        status,
      });

      if (status === "worse") score += 2;
      if (status === "similar") score += 1;
    }

    // Sleep comparison: less than 7 hours is shown as a possible wellbeing signal.
    if (avgSleep != null && populationInsomnia != null) {
      const status: ComparisonStatus =
        avgSleep < 6 ? "worse" : avgSleep < 7 ? "similar" : "better";

      comparisons.push({
        label: "Sleep pattern",
        userValue: `${avgSleep.toFixed(1)}h avg`,
        populationValue: `${populationInsomnia.toFixed(1)}% report insomnia`,
        status,
      });

      if (status === "worse") score += 2;
      if (status === "similar") score += 1;
    }

    // Fallback scoring is used if population data is unavailable.
    if (comparisons.length === 0) {
      if (avgMood < 4) score += 3;
      else if (avgMood < 6) score += 1;

      if (avgStress != null && avgStress > 7) score += 3;
      else if (avgStress != null && avgStress > 5) score += 1;

      if (avgSleep != null && avgSleep < 6) score += 2;
      else if (avgSleep != null && avgSleep < 7) score += 1;
    }

    if (score >= 5) {
      return {
        label: "Needs attention",
        description:
          "Your recent check-ins show several difficult patterns. Consider sharing this with a healthcare professional.",
        color: "text-destructive",
        icon: AlertTriangle,
        comparisons,
        score,
      };
    }

    if (score >= 2) {
      return {
        label: "Mixed patterns",
        description:
          "Some recent patterns may be worth watching. Keep checking in so changes are easier to notice.",
        color: "text-yellow-600",
        icon: AlertCircle,
        comparisons,
        score,
      };
    }

    return {
      label: "Stable pattern",
      description:
        "Your recent check-ins look relatively stable. Keep tracking to notice changes over time.",
      color: "text-emerald-600",
      icon: CheckCircle,
      comparisons,
      score,
    };
  }, [entries, populationData]);

  const Icon = analysis.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellbeing Pattern Summary</CardTitle>
        <CardDescription>
          A simple summary of recent mood, stress, sleep, and Finnish population
          reference data.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted ${analysis.color}`}
          >
            <Icon className="h-8 w-8" />
          </div>

          <div>
            <p className={`text-lg font-semibold ${analysis.color}`}>
              {analysis.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {analysis.description}
            </p>
          </div>
        </div>

        {analysis.comparisons.length > 0 && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">
              Pattern comparison
            </p>

            {analysis.comparisons.map((comparison) => (
              <div key={comparison.label} className="space-y-1">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {comparison.status === "worse" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                    ) : comparison.status === "better" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-yellow-500" />
                    )}

                    {comparison.label}
                  </span>

                  <span className="font-medium text-foreground">
                    {comparison.userValue}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-2">
                  <span>Finnish reference: {comparison.populationValue}</span>

                  <span
                    className={`font-medium ${
                      comparison.status === "worse"
                        ? "text-destructive"
                        : comparison.status === "better"
                        ? "text-emerald-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {comparison.status === "worse"
                      ? "Higher concern"
                      : comparison.status === "better"
                      ? "Lower concern"
                      : "Near reference level"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs italic text-muted-foreground">
          This is not a diagnosis or medical advice. If you are worried
          about your wellbeing, contact a healthcare professional.
        </p>
      </CardContent>
    </Card>
  );
}