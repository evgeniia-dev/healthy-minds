import { ArrowRight, Heart, Brain, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroFriends from "@/assets/hero-friends.jpg";
import heroGroup from "@/assets/hero-group.jpg";
import heroProfessional from "@/assets/hero-professional.jpg";

export default function Index() {
  const { user, role, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (user && role === "patient") {
    return <Navigate to="/patient/dashboard" replace />;
  }

  if (user && role === "professional") {
    return <Navigate to="/professional/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute left-0 right-0 top-0 z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-background" />
          <span className="text-lg font-bold text-background">Healthy Minds</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium text-background">
                {profile?.full_name || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-background/50 bg-background/20 text-background hover:bg-background/30 hover:text-background"
                onClick={handleLogout}
              >
                <LogOut className="mr-1 h-4 w-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-background hover:bg-background/20 hover:text-background"
                asChild
              >
                <Link to="/auth">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroFriends}
            alt="Friends laughing together in warm sunlight"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-background md:text-5xl lg:text-6xl">
              Healthy Minds
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-background/85 md:text-xl">
              A supportive platform for tracking mental wellbeing and helping
              patients and professionals work with clearer, more meaningful daily
              insights.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-background bg-background/20 text-base text-background hover:bg-background/30 hover:text-background"
                onClick={() =>
                  document.getElementById("services")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
            How We Help
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted-foreground">
            Tools designed to support a clearer view of mental wellbeing over time.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Daily Check-ins",
                description:
                  "Track mood, sleep, stress, and exercise with a simple daily log that takes less than a minute.",
              },
              {
                icon: Brain,
                title: "Personal Insights",
                description:
                  "See trends and correlations in your data over time and better understand what affects wellbeing.",
              },
              {
                icon: Users,
                title: "Professional Support",
                description:
                  "Enable healthcare professionals to review progress, add notes, and support each patient with better context.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-card-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <img
              src={heroGroup}
              alt="Group of friends enjoying time together"
              className="h-56 w-full rounded-xl object-cover shadow-md"
            />
            <img
              src={heroProfessional}
              alt="Professional in a supportive consultation session"
              className="mt-8 h-56 w-full rounded-xl object-cover shadow-md"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              You're Not Alone
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Healthy Minds helps make mental health patterns more visible through
              daily tracking, clearer trends, and better collaboration between
              patients and professionals.
            </p>

            <Button asChild size="lg" className="mt-8 text-base">
              <Link to="/auth">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span>© 2026 Healthy Minds</span>
          <span>Built for mental wellbeing tracking and support.</span>
        </div>
      </footer>
    </div>
  );
}