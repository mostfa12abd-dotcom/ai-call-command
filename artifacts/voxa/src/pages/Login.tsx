import { FormEvent, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ── Soft ambient glow — follows mouse, muted purple ────────────────────── */
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    let rafId: number;
    const el = glowRef.current;
    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      if (el) {
        el.style.backgroundImage =
          `radial-gradient(ellipse 400px 300px at ${cx}px ${cy}px,` +
          `rgba(124,58,237,0.07) 0%,` +
          `rgba(80,140,255,0.04) 45%,` +
          `rgba(6,182,212,0.02) 70%,` +
          `transparent 100%)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    rafId = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, []);

  /* ── Sand-particle field — more visible, reacts to cursor ───────────────── */
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mx = -2000, my = -2000;

    interface P { x: number; y: number; ox: number; oy: number; vx: number; vy: number; r: number; op: number; hue: number; }
    let pts: P[] = [];

    const build = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      pts = [];
      const n = Math.round((canvas.width * canvas.height) / 5000); /* more particles */
      for (let i = 0; i < n; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        pts.push({
          x, y, ox: x, oy: y, vx: 0, vy: 0,
          r: Math.random() * 1.6 + 0.5,
          op: Math.random() * 0.45 + 0.20, /* higher base opacity — more visible */
          hue: Math.random() > 0.55 ? 262 : 195
        });
      }
    };
    build();
    window.addEventListener("resize", build);

    const PUSH_R    = 120;
    const VISIBLE_R = 200; /* wider visibility radius */
    const SPRING    = 0.018;
    const DAMP      = 0.90;
    const PUSH_F    = 1.6;
    let rafId: number;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < PUSH_R * PUSH_R) {
          const d = Math.sqrt(d2);
          const f = (1 - d / PUSH_R) * PUSH_F;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;
        p.vx *= DAMP; p.vy *= DAMP;
        p.x += p.vx; p.y += p.vy;

        const dist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
        const near = Math.max(0, 1 - dist / VISIBLE_R);
        const alpha = p.op + near * near * 0.5; /* stronger cursor boost */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + near * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},65%,70%,${Math.min(alpha, 0.85)})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    rafId = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", build);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please enter your email and password.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Welcome!" });
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ title: "Welcome back", description: "Signed in successfully." });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({ title: "Authentication error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex text-foreground selection:bg-primary/30 relative overflow-hidden">
      {/* ── Particle canvas ────────────────────────────────────────────────── */}
      <canvas
        ref={particleCanvasRef}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}
      />
      {/* ── Soft ambient glow ─────────────────────────────────────────────── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 8, willChange: "background-image" }}
      />
      {/* Left: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-1/2 lg:px-20 z-10 relative">
        <div className="mx-auto w-full max-w-md">
          {/* Brand - Removed Voxa and Logo */}
          <div className="mb-10 flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight uppercase">{t("nav.workspace")}</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{isSignUp ? "Create an account" : t("login.welcome")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp ? "Sign up to start using your AI Call Center dashboard" : t("login.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.password")}</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => toast({ title: "Reset link sent", description: "Check your inbox." })}
                >
                  {t("login.forgot")}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
              />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                {t("login.remember")}
              </Label>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isSignUp ? "Sign up" : t("common.signIn")
              )}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
                  {t("login.or")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => toast({ title: "Coming soon", description: "Google sign-in is UI-only for now." })}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              {t("login.continueGoogle")}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : t("login.noAccount")}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? t("common.signIn") : t("login.createOne")}
            </button>
          </p>
        </div>
      </div>

      {/* Right: Decorative panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2" style={{ background: "linear-gradient(135deg, hsl(262 55% 40%) 0%, hsl(262 50% 25%) 50%, hsl(220 40% 15%) 100%)" }}>
        <div className="absolute inset-0" style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, hsl(262 60% 65% / 0.25) 0, transparent 45%), radial-gradient(circle at 75% 65%, hsl(195 85% 55% / 0.20) 0, transparent 45%)",
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <span className="h-2 w-2 rounded-full bg-success" />
            {t("login.live")}
          </div>

          <div className="space-y-6">
            <h2 className="whitespace-pre-line text-4xl font-bold leading-tight">
              {t("login.heroTitle")}
            </h2>
            <p className="max-w-md text-base leading-relaxed opacity-90">
              {t("login.heroBody")}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { k: "98%", v: t("login.statPickup") },
                { k: "2.4m", v: t("login.statDuration") },
                { k: "4.8★", v: t("login.statSatisfaction") },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{s.k}</div>
                  <div className="mt-1 text-xs opacity-80">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs opacity-70">{t("login.footer")}</p>
        </div>
      </div>
    </div>
  );
}
