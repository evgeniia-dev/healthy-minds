import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const moodEmojis = ["", "😞", "😔", "😟", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩"];

export function DailyCheckin({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [moodScore, setMoodScore] = useState(5);
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("mood_entries").upsert({
      user_id: user.id,
      entry_date: new Date().toISOString().split("T")[0],
      mood_score: moodScore,
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      stress_level: stressLevel,
      exercise_minutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
      notes: notes || null,
    }, { onConflict: "user_id,entry_date" });

    if (error) toast.error("Failed to save check-in");
    else {
      toast.success("Check-in saved!");
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Daily Check-in <span className="text-2xl">{moodEmojis[moodScore]}</span>
        </CardTitle>
        <CardDescription>How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Mood ({moodScore}/10)</Label>
            <Slider value={[moodScore]} onValueChange={([v]) => setMoodScore(v)} min={1} max={10} step={1} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span><span>Excellent</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Stress Level ({stressLevel}/10)</Label>
            <Slider value={[stressLevel]} onValueChange={([v]) => setStressLevel(v)} min={1} max={10} step={1} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Relaxed</span><span>Very Stressed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep (hours)</Label>
              <Input id="sleep" type="number" step="0.5" min="0" max="24" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} placeholder="e.g. 7.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise (min)</Label>
              <Input id="exercise" type="number" min="0" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value)} placeholder="e.g. 30" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How was your day?" rows={3} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Check-in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
