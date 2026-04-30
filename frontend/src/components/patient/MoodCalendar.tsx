import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  entry_date: string;
  mood_score: number;
}

const moodColors: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-red-400",
  3: "bg-orange-400",
  4: "bg-orange-300",
  5: "bg-yellow-400",
  6: "bg-yellow-300",
  7: "bg-green-300",
  8: "bg-green-400",
  9: "bg-emerald-400",
  10: "bg-emerald-500",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MoodCalendar({ entries }: { entries: MoodEntry[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const entryMap = useMemo(() => {
    const map: Record<string, number> = {};

    entries.forEach((entry) => {
      map[entry.entry_date] = entry.mood_score;
    });

    return map;
  }, [entries]);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      }),
    [currentMonth]
  );

  const startDay = getDay(startOfMonth(currentMonth));

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="space-y-3 px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Mood Calendar</CardTitle>
            <CardDescription className="mt-1">
              See your mood check-ins in a monthly calendar. 
              Each day shows how you felt, making it easier to notice mood patterns over time.
            </CardDescription>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="min-w-[120px] text-center text-sm font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 overflow-x-auto px-3 sm:px-6">
        <div className="grid min-w-[300px] grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-1 text-center text-[10px] font-medium text-muted-foreground sm:text-xs"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {days.map((day) => {
            const dateString = format(day, "yyyy-MM-dd");
            const score = entryMap[dateString];

            return (
              <Tooltip key={dateString}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex aspect-square min-h-9 items-center justify-center rounded-md text-xs ${
                      score
                        ? `${moodColors[score]} font-medium text-white`
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </TooltipTrigger>

                <TooltipContent>
                  <p>
                    {score
                      ? `Mood: ${score}/10`
                      : "No check-in recorded for this day"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>Lower mood</span>
          {[1, 3, 5, 7, 9, 10].map((score) => (
            <div
              key={score}
              className={`h-3 w-3 rounded-sm ${moodColors[score]}`}
            />
          ))}
          <span>Higher mood</span>
        </div>
      </CardContent>
    </Card>
  );
}