import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { TrendCharts } from "@/components/patient/TrendCharts";
import { MoodCalendar } from "@/components/patient/MoodCalendar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type PatientProfile = {
  id: string;
  email: string;
  full_name: string | null;
};

type MoodEntry = {
  id: string;
  entry_date: string;
  mood_score: number;
  sleep_hours: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
};

type TreatmentNote = {
  id: string;
  note_type: string;
  content: string;
  created_at: string;
};

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [notes, setNotes] = useState<TreatmentNote[]>([]);

  const [noteType, setNoteType] = useState("session");
  const [noteContent, setNoteContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);

  const getToken = () => localStorage.getItem("access_token");

  /**
   * Fetch patient profile
   */
  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token || !patientId) return;

    const res = await fetch(`${API_URL}/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Failed to load patient");

    setProfile(data);
  }, [patientId]);

  /**
   * Fetch patient mood entries
   */
  const fetchEntries = useCallback(async () => {
    const token = getToken();
    if (!token || !patientId) return;

    const res = await fetch(
      `${API_URL}/patients/${patientId}/mood-entries`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Failed to load entries");

    setEntries(data);
  }, [patientId]);

  /**
   * Fetch treatment notes
   */
  const fetchNotes = useCallback(async () => {
    const token = getToken();
    if (!token || !patientId) return;

    const res = await fetch(
      `${API_URL}/patients/${patientId}/treatment-notes`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Failed to load notes");

    setNotes(data);
  }, [patientId]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (!patientId) return;

    const loadAll = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchProfile(),
          fetchEntries(),
          fetchNotes(),
        ]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    void loadAll();
  }, [patientId, fetchProfile, fetchEntries, fetchNotes]);

  /**
   * Add treatment note
   */
  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = getToken();

    if (!token || !patientId) {
      toast.error("Not authenticated");
      return;
    }

    if (!noteContent.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    try {
      setSavingNote(true);

      const res = await fetch(
        `${API_URL}/patients/${patientId}/treatment-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            note_type: noteType,
            content: noteContent.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save note");
      }

      toast.success("Note saved");
      setNoteContent("");

      await fetchNotes();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const noteTypeBadge: Record<string, string> = {
    medication: "bg-blue-100 text-blue-800",
    intervention: "bg-purple-100 text-purple-800",
    session: "bg-green-100 text-green-800",
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading patient data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {profile?.full_name || "Patient"}
        </h1>
        <p className="text-muted-foreground">
          Mood trends and treatment notes
        </p>
      </div>

      <MoodCalendar entries={entries} />
      <TrendCharts entries={entries} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add note */}
        <Card>
          <CardHeader>
            <CardTitle>Add Treatment Note</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">Session</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="intervention">Intervention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Note</Label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={savingNote}>
                {savingNote ? "Saving..." : "Save Note"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notes list */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment History</CardTitle>
          </CardHeader>

          <CardContent>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No notes yet.
              </p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <Badge className={noteTypeBadge[note.note_type]}>
                        {note.note_type}
                      </Badge>

                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}