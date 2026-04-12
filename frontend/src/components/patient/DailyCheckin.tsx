import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const moodEmojis = ["", "😞", "😔", "😟", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩"];

export function DailyCheckin({ onSuccess }: { onSuccess?: () => void }) {
  const [moodScore, setMoodScore] = useState(5);
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/mood-entries/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood_score: moodScore,
          sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
          stress_level: stressLevel,
          exercise_minutes: exerciseMinutes ? parseInt(exerciseMinutes, 10) : null,
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to save check-in");
        setLoading(false);
        return;
      }

      toast.success("Check-in saved!");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save check-in:", error);
      toast.error("Failed to save check-in");
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
            <Slider
              value={[moodScore]}
              onValueChange={([value]) => setMoodScore(value)}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Stress Level ({stressLevel}/10)</Label>
            <Slider
              value={[stressLevel]}
              onValueChange={([value]) => setStressLevel(value)}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Relaxed</span>
              <span>Very Stressed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep (hours)</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="e.g. 7.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise (min)</Label>
              <Input
                id="exercise"
                type="number"
                min="0"
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your day?"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Check-in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}