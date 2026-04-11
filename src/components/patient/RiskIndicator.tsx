import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

// Population baselines derived from latest Sotkanet data:
// - "Severe mental strain" ~18.6% → maps to stress_level: avg population stress ~5.6/10
// - "Anxiety or insomnia" ~9.3% → maps to sleep quality issues
// We convert user 1-10 scales to population-comparable percentages.
function userStressToPopulationPercent(avgStress: number): number {
  // Stress 1-10 mapped to approximate population % experiencing severe strain
  // Population baseline ~18.6% (2024). A user at stress 5 ≈ population average.
  return Math.min(100, Math.max(0, (avgStress / 10) * 100));
}

function userMoodToWellbeingPercent(avgMood: number): number {
  // Mood 1-10: higher is better. Invert to get "strain" percentage.
  // Population baseline: ~18.6% report severe strain → mood ~4 maps to that range.
  return Math.min(100, Math.max(0, ((10 - avgMood) / 10) * 100));
}

export function RiskIndicator({ entries, populationData }: { entries: MoodEntry[]; populationData: HealthData[] }) {
  const analysis = useMemo(() => {
    if (entries.length < 7) {
      return {
        level: "insufficient" as const,
        label: "Not enough data",
        description: "Log at least 7 days of data for risk assessment.",
        color: "text-muted-foreground",
        icon: AlertCircle,
        comparisons: [],
        score: 0,
      };
    }

    const last30 = entries.slice(-30);
    const avgMood = last30.reduce((a, b) => a + b.mood_score, 0) / last30.length;
    const stressEntries = last30.filter((e) => e.stress_level != null);
    const avgStress = stressEntries.length > 0
      ? stressEntries.reduce((a, b) => a + (b.stress_level ?? 0), 0) / stressEntries.length
      : null;
    const sleepEntries = last30.filter((e) => e.sleep_hours != null);
    const avgSleep = sleepEntries.length > 0
      ? sleepEntries.reduce((a, b) => a + (b.sleep_hours ?? 0), 0) / sleepEntries.length
      : null;

    // Get latest population values
    const getLatestIndicator = (keyword: string) => {
      const matches = populationData
        .filter((d) => d.indicator_name.toLowerCase().includes(keyword) && d.value != null);
      return matches.length > 0 ? matches[0].value! : null;
    };

    const popStrain = getLatestIndicator("severe mental strain"); // ~18.6%
    const popAnxiety = getLatestIndicator("anxiety or insomnia"); // ~9.3%

    // Build comparison insights
    const comparisons: { label: string; userValue: string; populationValue: string; status: "better" | "worse" | "similar" }[] = [];

    let score = 0;

    // Mood comparison: user mood < 4 maps roughly to "severe strain" territory
    const userStrainPercent = userMoodToWellbeingPercent(avgMood);
    if (popStrain != null) {
      const status = userStrainPercent > popStrain * 1.3 ? "worse" : userStrainPercent < popStrain * 0.7 ? "better" : "similar";
      comparisons.push({
        label: "Mental strain level",
        userValue: `${userStrainPercent.toFixed(0)}%`,
        populationValue: `${popStrain.toFixed(1)}%`,
        status,
      });
      if (status === "worse") score += 3;
      else if (status === "similar") score += 1;
    }

    // Stress comparison
    if (avgStress != null && popStrain != null) {
      const userStressPercent = userStressToPopulationPercent(avgStress);
      const status = userStressPercent > popStrain * 1.3 ? "worse" : userStressPercent < popStrain * 0.7 ? "better" : "similar";
      comparisons.push({
        label: "Stress vs population",
        userValue: `${avgStress.toFixed(1)}/10`,
        populationValue: `${popStrain.toFixed(1)}% report strain`,
        status,
      });
      if (status === "worse") score += 2;
      else if (status === "similar") score += 1;
    }

    // Sleep comparison: <7h is concerning, population anxiety ~9.3% correlates with poor sleep
    if (avgSleep != null && popAnxiety != null) {
      const poorSleep = avgSleep < 7;
      const status = poorSleep && avgSleep < 6 ? "worse" : poorSleep ? "similar" : "better";
      comparisons.push({
        label: "Sleep quality",
        userValue: `${avgSleep.toFixed(1)}h avg`,
        populationValue: `${popAnxiety.toFixed(1)}% report insomnia`,
        status,
      });
      if (status === "worse") score += 2;
      else if (status === "similar") score += 1;
    }

    // Fallback scoring when no population data
    if (comparisons.length === 0) {
      if (avgMood < 4) score += 3;
      else if (avgMood < 6) score += 1;
      if (avgStress != null && avgStress > 7) score += 3;
      else if (avgStress != null && avgStress > 5) score += 1;
      if (avgSleep != null && avgSleep < 6) score += 2;
      else if (avgSleep != null && avgSleep < 7) score += 1;
    }

    if (score >= 5) {
      return { level: "elevated" as const, label: "Elevated Risk", description: "Your recent patterns are above population averages for mental strain. Consider reaching out to a professional.", color: "text-destructive", icon: AlertTriangle, comparisons, score };
    }
    if (score >= 2) {
      return { level: "moderate" as const, label: "Moderate", description: "Some of your indicators are near Finnish population averages. Keep tracking to maintain awareness.", color: "text-yellow-600", icon: AlertCircle, comparisons, score };
    }
    return { level: "low" as const, label: "Low Risk", description: "Your behavioral patterns are better than Finnish population averages. Keep up the good work!", color: "text-emerald-600", icon: CheckCircle, comparisons, score };
  }, [entries, populationData]);

  const Icon = analysis.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>Your trends vs. Finnish population baselines (THL Sotkanet)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-muted ${analysis.color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <p className={`text-lg font-semibold ${analysis.color}`}>{analysis.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{analysis.description}</p>
          </div>
        </div>

        {analysis.comparisons.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Population Comparison</p>
            {analysis.comparisons.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    {c.status === "worse" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                    ) : c.status === "better" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <span className="h-3.5 w-3.5 inline-block rounded-full bg-yellow-500" />
                    )}
                    {c.label}
                  </span>
                  <span className="font-medium text-foreground">{c.userValue}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Finnish avg: {c.populationValue}</span>
                  <span className={`text-xs font-medium ${
                    c.status === "worse" ? "text-destructive" : c.status === "better" ? "text-emerald-600" : "text-yellow-600"
                  }`}>
                    {c.status === "worse" ? "Above average" : c.status === "better" ? "Below average" : "Near average"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground italic">
          ⚠️ This is not a clinical diagnosis. Population data from THL Sotkanet (CC 4.0). Consult a healthcare professional for medical advice.
        </p>
      </CardContent>
    </Card>
  );
}
