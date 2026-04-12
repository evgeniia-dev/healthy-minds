import { DailyCheckin } from "@/components/patient/DailyCheckin";
import { useNavigate } from "react-router-dom";

export default function Checkin() {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Daily Check-in</h1>
      <DailyCheckin onSuccess={() => navigate("/")} />
    </div>
  );
}
