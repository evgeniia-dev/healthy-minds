import { useEffect, useState } from "react";
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

const API_URL = "http://127.0.0.1:8000";

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
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchPatients = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    try {
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
    }
  };

  useEffect(() => {
    if (user) {
      void fetchPatients();
    }
  }, [user]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("You are not authenticated");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Failed to create patient");
        setLoading(false);
        return;
      }

      toast.success(`Patient ${newName} created`);
      setOpen(false);
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      await fetchPatients();
    } catch (error) {
      console.error("Create patient failed:", error);
      toast.error("Unexpected error");
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
              <DialogTitle>Add New Patient</DialogTitle>
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

              <div className="space-y-2">
                <Label htmlFor="patient-password">Temporary Password</Label>
                <Input
                  id="patient-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Patient"}
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
                <TableHead>Email</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No patients yet. Click "Add Patient" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.full_name || "Unknown"}
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