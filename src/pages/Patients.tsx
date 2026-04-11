import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PatientRow = {
  patient_id: string;
  created_at: string;
  profile?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export default function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const fetchPatients = async () => {
    if (!user) return;

    const { data: links, error: linksError } = await supabase
      .from("patient_professional_links")
      .select("patient_id, created_at")
      .eq("professional_id", user.id);

    if (linksError) {
      console.error("Failed to fetch patient links:", linksError);
      toast.error("Failed to load patients");
      return;
    }

    if (!links || links.length === 0) {
      setPatients([]);
      return;
    }

    const patientIds = links.map((link) => link.patient_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", patientIds);

    if (profilesError) {
      console.error("Failed to fetch patient profiles:", profilesError);
      toast.error("Failed to load patient profiles");
      return;
    }

    const mergedPatients: PatientRow[] = links.map((link) => ({
      ...link,
      profile: profiles?.find((profile) => profile.user_id === link.patient_id),
    }));

    setPatients(mergedPatients);
  };

  useEffect(() => {
    void fetchPatients();
  }, [user]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-patient", {
        body: {
          email: newEmail,
          full_name: newName,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to invite patient");
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(`Invitation sent to ${newEmail}`);
        setOpen(false);
        setNewEmail("");
        setNewName("");
        await fetchPatients();
      }
    } catch (error: any) {
      console.error("Create patient failed:", error);
      toast.error(error.message || "Unexpected error");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Patients</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Patient</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient-email">Email</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <p className="text-sm text-muted-foreground">
                The patient will receive an email invitation to join the platform.
              </p>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending invite..." : "Send Invitation"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No patients yet. Click &quot;Add Patient&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.patient_id}>
                    <TableCell className="font-medium">
                      {patient.profile?.full_name || "Unknown"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/professional/patients/${patient.patient_id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}