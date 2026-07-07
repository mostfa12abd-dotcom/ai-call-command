import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/**
 * OAuth callback handler.
 *
 * Supabase's built-in _getSessionFromURL calls _getUser which fails in this
 * environment ("String contains non ISO-8859-1 code point" header error).
 * Work-around:
 *   1. detectSessionInUrl: false — prevents the auto-processing on init.
 *   2. Parse hash manually → call refreshSession({ refresh_token }), which
 *      only uses the apikey header (ASCII-safe) and never calls _getUser.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("جارٍ معالجة تسجيل الدخول…");

  useEffect(() => {
    (async () => {
      try {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);

        // --- Implicit flow: tokens in the URL hash ---
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const refreshToken = hashParams.get("refresh_token");
          const error = hashParams.get("error");
          const errorDescription = hashParams.get("error_description");

          if (error) {
            setStatus(`خطأ من Google: ${errorDescription || error}`);
            return;
          }

          if (refreshToken) {
            setStatus("جارٍ إنشاء الجلسة…");
            const { data, error: err } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
            if (data.session) {
              navigate("/dashboard", { replace: true });
              return;
            }
            setStatus(`فشل تسجيل الدخول: ${err?.message ?? "خطأ غير معروف"}`);
            return;
          }
        }

        // --- PKCE flow: code in query params ---
        if (searchParams.get("code")) {
          setStatus("جارٍ تبادل الكود…");
          const { data, error: err } = await supabase.auth.exchangeCodeForSession(
            searchParams.get("code")!
          );
          if (data.session) {
            navigate("/dashboard", { replace: true });
            return;
          }
          setStatus(`فشل: ${err?.message ?? "لا توجد جلسة"}`);
          return;
        }

        // Nothing in URL — check if session already exists (e.g. page reload)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/dashboard", { replace: true });
          return;
        }

        setStatus("لا توجد بيانات تسجيل دخول. سيتم إعادة توجيهك…");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
        setStatus(`خطأ: ${msg}`);
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    })();
  }, [navigate]);

  const isError = status.startsWith("خطأ") || status.startsWith("فشل") || status.startsWith("لا توجد");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      {isError ? (
        <>
          <p className="text-destructive text-sm text-center max-w-xs">{status}</p>
          <a href="/login" className="underline text-sm">العودة لتسجيل الدخول</a>
        </>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{status}</p>
        </>
      )}
    </div>
  );
}
