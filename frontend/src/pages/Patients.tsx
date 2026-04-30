import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";
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

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type PatientRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [open, setOpen] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchPatients = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("You are not authenticated");
      setLoadingPatients(false);
      return;
    }

    try {
      setLoadingPatients(true);

      // Loads only patients assigned to the current professional.
      const response = await fetch(`${API_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to load patients");
        return;
      }

      setPatients(data);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "professional") {
      void fetchPatients();
    } else {
      setLoadingPatients(false);
    }
  }, [user, fetchPatients]);

  const handleAddPatient = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
      setCreatingPatient(true);

      // Professional creates a patient account with a temporary password.
      const response = await fetch(`${API_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPassword,
          full_name: newName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to create patient");
        return;
      }

      toast.success(`Patient ${newName.trim()} created`);
      setOpen(false);
      setNewEmail("");
      setNewName("");
      setNewPassword("");

      await fetchPatients();
    } catch (error) {
      console.error("Create patient failed:", error);
      toast.error("Failed to create patient");
    } finally {
      setCreatingPatient(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient accounts connected to your profile.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient name</Label>
                <Input
                  id="patient-name"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  required
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient-email">Email</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  required
                  placeholder="patient@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient-password">Temporary password</Label>
                <Input
                  id="patient-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>

              <Button type="submit" className="w-full" disabled={creatingPatient}>
                {creatingPatient ? "Creating..." : "Create Patient"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loadingPatients ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No patients yet. Click “Add Patient” to get started.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.full_name || "Unnamed patient"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {patient.email}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`View ${patient.full_name || patient.email}`}
                        onClick={() =>
                          navigate(`/professional/patients/${patient.id}`)
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