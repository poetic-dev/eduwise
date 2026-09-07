import { Link } from "react-router-dom";
import {
  AnimatedButton,
  Button,
  Card,
  CardContent,
  FadeUpText,
  GradientText,
  HoverScaleCard,
} from "@arcevo/facet-components";
import GeneratedIcon from "../../icons.generated.tsx";
import BrandLogo from "../BrandLogo";
import { WHY_POINTS } from "./content";

interface LandingHeroProps {
  needsConsent: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  /** Furthest completed assessment step's route ("" when nothing started). */
  resumeRoute: string | null;
  onStart: () => void;
  onGuestLogin: () => Promise<void>;
  onViewHistory: () => void;
}

export default function LandingHero({
  needsConsent,
  isAuthenticated,
  isGuest,
  resumeRoute,
  onStart,
  onGuestLogin,
  onViewHistory,
}: LandingHeroProps) {
  const ctaLabel = needsConsent
    ? "Complete Consent & Start"
    : isAuthenticated && !isGuest
      ? resumeRoute === "/history"
        ? "View My Results"
        : "Continue Assessment"
      : "Take the Assessment";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 text-center">
      <BrandLogo className="mx-auto h-24 w-24 shadow-md" />
      <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
        <GradientText
          text="Find the academic stream that fits you"
          colors={["hsl(var(--primary))", "hsl(var(--secondary))"]}
        />
      </h1>
      <FadeUpText
        delay={200}
        className="mx-auto mt-3 block max-w-3xl text-sm leading-relaxed text-muted-foreground"
      >
        StreamWise recommends a Science, Humanities, or Business stream to Nigerian SS2
        students using a research-backed AHP-SAW decision engine: your academic scores,
        vocational interests, and personality, combined into one clear recommendation.
      </FadeUpText>

      {/* Why it matters: a compact, scannable teaser. The full context lives
          in the "Why StreamWise?" section below the hero. */}
      <div className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {WHY_POINTS.map((s) => (
          <HoverScaleCard key={s.title} scale={1.02} lift className="rounded-2xl shadow-lg">
            <Card variant="glass" className="h-full rounded-2xl border-border/60 text-left">
            <CardContent className="flex h-full flex-col pt-5">
              <div className="flex items-center gap-3 sm:block">
                <GeneratedIcon name={s.icon} size={18} className="text-primary shrink-0" />
                <p className="mt-0 sm:mt-2 text-xl font-black tracking-tight tabular-nums text-foreground">
                  {s.stat}
                </p>
              </div>
              <p className="mt-0.5 text-xs font-medium leading-snug text-muted-foreground sm:mt-1">
                {s.title}
              </p>
            </CardContent>
          </Card>
        </HoverScaleCard>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <AnimatedButton animation="sparkle" onClick={onStart} className="h-12 px-8 text-lg">
          {ctaLabel}
          <GeneratedIcon name="arrow-right" size={16} />
        </AnimatedButton>
        {isAuthenticated && !isGuest ? (
          <Button variant="outline" size="lg" onClick={onViewHistory}>
            My History
          </Button>
        ) : (
          <Button asChild variant="outline" size="lg">
            <Link to="/login">Sign in to my results</Link>
          </Button>
        )}
      </div>

      {/* Guest reviewer access: browse the system without an account. */}
      {!isGuest && (
        <div className="mt-5">
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => void onGuestLogin()}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Continue as guest reviewer → no account needed
          </Button>
        </div>
      )}

      {isGuest && (
        <p className="mt-5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
          You're browsing as a guest · create an account to start the assessment
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Free for SS2 students · Takes about 15 minutes · Retake as many times as you like
      </p>
    </div>
  );
}
