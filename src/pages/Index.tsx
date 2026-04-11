import { ArrowRight, Heart, Brain, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroFriends from "@/assets/hero-friends.jpg";
import heroGroup from "@/assets/hero-group.jpg";
import heroProfessional from "@/assets/hero-professional.jpg";

export default function Index() {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-background" />
          <span className="font-bold text-lg text-background">Healthy Minds</span>
        </div>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="text-sm font-medium text-background">
                {profile?.full_name || user.email}
              </span>
              <Button variant="outline" size="sm" className="border-background/50 bg-background/20 text-background hover:bg-background/30 hover:text-background" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-background hover:bg-background/20 hover:text-background" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroFriends}
            alt="Friends laughing together in warm sunlight"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-44">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight tracking-tight">
              Healthy Minds
            </h1>
            <p className="mt-4 text-lg md:text-xl text-background/85 leading-relaxed">
              A supportive platform for tracking your mental wellbeing and
              connecting with professionals who care. Small daily steps lead to
              lasting change.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base">
                <Link to="/checkin">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base border-background bg-background/20 text-background hover:bg-background/30 hover:text-background"
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
            How We Help
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-2xl mx-auto text-lg">
            Tools designed around your wellbeing journey
          </p>
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Daily Check-ins",
                description:
                  "Track mood, sleep, stress, and exercise with a simple daily log that takes under a minute.",
              },
              {
                icon: Brain,
                title: "Personal Insights",
                description:
                  "See trends and correlations in your data over time — understand what supports your wellbeing.",
              },
              {
                icon: Users,
                title: "Professional Support",
                description:
                  "Your healthcare professionals will take care of your journey and monitor your progress.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-xl border border-border bg-card p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-card-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / CTA Section */}
      <section className="py-20 md:py-28 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img
              src={heroGroup}
              alt="Group of friends enjoying time together"
              className="rounded-xl w-full h-56 object-cover shadow-md"
            />
            <img
              src={heroProfessional}
              alt="Professional in a supportive consultation session"
              className="rounded-xl w-full h-56 object-cover shadow-md mt-8"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              You're Not Alone
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Whether you're a patient looking to understand yourself better or a
              professional supporting others, Healthy Minds gives you the tools
              to make mental health visible, trackable, and actionable.
            </p>
            <Button asChild size="lg" className="mt-8 text-base">
              <Link to="/checkin">
                Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 Healthy Minds. All rights reserved.</span>
          <span>Built with care for mental wellbeing.</span>
        </div>
      </footer>
    </div>
  );
}
