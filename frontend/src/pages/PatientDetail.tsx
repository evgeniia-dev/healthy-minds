import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type PatientProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
};

type MoodEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  mood_score: number;
  sleep_hours: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
  notes: string | null;
};

type TreatmentNote = {
  id: string;
  patient_id: string;
  professional_id: string;
  note_type: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [notes, setNotes] = useState<TreatmentNote[]>([]);
  const [noteType, setNoteType] = useState("session");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("access_token");

  const fetchProfile = async () => {
    const token = getToken();
    if (!token || !patientId) return;

    try {
      const response = await fetch(`${API_URL}/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to load patient");
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch patient profile:", error);
      toast.error("Failed to load patient");
    }
  };

  const fetchEntries = async () => {
    const token = getToken();
    if (!token || !patientId) return;

    try {
      const response = await fetch(`${API_URL}/patients/${patientId}/mood-entries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to load mood entries");
        return;
      }

      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch patient mood entries:", error);
      toast.error("Failed to load mood entries");
    }
  };

  const fetchNotes = async () => {
    const token = getToken();
    if (!token || !patientId) return;

    try {
      const response = await fetch(`${API_URL}/patients/${patientId}/treatment-notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to load treatment notes");
        return;
      }

      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch treatment notes:", error);
      toast.error("Failed to load treatment notes");
    }
  };

  useEffect(() => {
    if (!patientId) return;
    void fetchProfile();
    void fetchEntries();
    void fetchNotes();
  }, [patientId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();

    if (!token || !patientId) {
      toast.error("You are not authenticated");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/patients/${patientId}/treatment-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note_type: noteType,
          content: noteContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to save note");
        setLoading(false);
        return;
      }

      toast.success("Note saved!");
      setNoteContent("");
      await fetchNotes();
    } catch (error) {
      console.error("Failed to save treatment note:", error);
      toast.error("Failed to save note");
    }

    setLoading(false);
  };

  const noteTypeBadge: Record<string, string> = {
    medication: "bg-blue-100 text-blue-800",
    intervention: "bg-purple-100 text-purple-800",
    session: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {profile?.full_name || "Patient"}
        </h1>
        <p className="text-muted-foreground">
          Patient overview and treatment notes
        </p>
      </div>

      <MoodCalendar entries={entries} />
      <TrendCharts entries={entries} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Treatment Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">Session Note</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="intervention">Intervention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Note"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment History</CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No treatment notes yet.
              </p>
            ) : (
              <div className="max-h-[400px] space-y-4 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={noteTypeBadge[note.note_type] || ""}
                        variant="secondary"
                      >
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