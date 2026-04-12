import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MoodEntry {
  entry_date: string;
  mood_score: number;
}

const moodColors: Record<number, string> = {
  1: "bg-red-500", 2: "bg-red-400", 3: "bg-orange-400",
  4: "bg-orange-300", 5: "bg-yellow-400", 6: "bg-yellow-300",
  7: "bg-green-300", 8: "bg-green-400", 9: "bg-emerald-400", 10: "bg-emerald-500",
};

export function MoodCalendar({ entries }: { entries: MoodEntry[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const entryMap = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => { map[e.entry_date] = e.mood_score; });
    return map;
  }, [entries]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mood Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground p-1">{d}</div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const score = entryMap[dateStr];
            return (
              <Tooltip key={dateStr}>
                <TooltipTrigger asChild>
                  <div className={`aspect-square rounded-md flex items-center justify-center text-xs cursor-default ${score ? `${moodColors[score]} text-white font-medium` : "bg-muted/50 text-muted-foreground"}`}>
                    {format(day, "d")}
                  </div>
                </TooltipTrigger>
                {score && (
                  <TooltipContent>
                    <p>Mood: {score}/10</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Low</span>
          {[1, 3, 5, 7, 9, 10].map((s) => (
            <div key={s} className={`h-3 w-3 rounded-sm ${moodColors[s]}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">High</span>
        </div>
      </CardContent>
    </Card>
  );
}
