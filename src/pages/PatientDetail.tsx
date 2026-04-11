import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendCharts } from "@/components/patient/TrendCharts";
import { MoodCalendar } from "@/components/patient/MoodCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [noteType, setNoteType] = useState("session");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) return;

    supabase.from("profiles").select("*").eq("user_id", patientId).maybeSingle()
      .then(({ data }) => setProfile(data));

    supabase.from("mood_entries").select("*").eq("user_id", patientId).order("entry_date", { ascending: true })
      .then(({ data }) => { if (data) setEntries(data); });

    fetchNotes();
  }, [patientId]);

  const fetchNotes = async () => {
    if (!patientId) return;
    const { data } = await supabase
      .from("treatment_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (data) setNotes(data);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !patientId) return;
    setLoading(true);
    const { error } = await supabase.from("treatment_notes").insert({
      patient_id: patientId,
      professional_id: user.id,
      note_type: noteType,
      content: noteContent,
    });
    if (error) toast.error("Failed to save note");
    else {
      toast.success("Note saved!");
      setNoteContent("");
      fetchNotes();
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
        <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "Patient"}</h1>
        <p className="text-muted-foreground">Patient overview and treatment notes</p>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">Session Note</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="intervention">Intervention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} required rows={4} />
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
              <p className="text-muted-foreground text-sm">No treatment notes yet.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={noteTypeBadge[n.note_type] || ""} variant="secondary">
                        {n.note_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{n.content}</p>
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
