import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  meet,
  MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';

export default function SidePanel() {
  const [sidePanelClient, setSidePanelClient] = useState<MeetSidePanelClient>();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const hasSignedIn = useMemo(() => Boolean(user), [user]);

  // Launches the main stage when the main button is clicked.
  async function startActivity() {

    if (!sidePanelClient || !hasSignedIn) {
      return;
    }

    const payload = {
      sender: user,
      submittedAt: new Date().toISOString()
    };

    await sidePanelClient.startActivity({
      mainStageUrl: import.meta.env.VITE_MAIN_STAGE_URL,
      additionalData: JSON.stringify(payload),
    });
  }

  function decodeJwtPayload(token: string) {
    const payload = token.split(".")[1];
    if (!payload) {
      throw new Error("Invalid token");
    }
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload) as {
      name?: string;
      email?: string;
      picture?: string;
    };
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      setAuthError("Missing VITE_GOOGLE_OAUTH_CLIENT_ID.");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tryInit = () => {
      if (cancelled) {
        return;
      }

      const google = window.google;
      if (google?.accounts?.id && googleButtonRef.current) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: google.accounts.id.CredentialResponse) => {
            try {
              const profile = decodeJwtPayload(response.credential);

              setUser({
                name: profile.name!,
                email: profile.email!,
                picture: profile.picture!,
              });
              setAuthError(null);
            } catch (error) {
              setAuthError((error as Error).message);
            }
          }
        });

        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill"
        });
        return;
      }

      attempts += 1;
      if (attempts < 10) {
        setTimeout(tryInit, 250);
      } else {
        setAuthError("Google Sign-In failed to load.");
      }
    };

    tryInit();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Prepares the add-on Side Panel Client.
   */
  useEffect(() => {
    (async () => {
      const session = await meet.addon.createAddonSession({
        cloudProjectNumber: import.meta.env.VITE_GOOGLE_PROJECT_NUMBER,
      });
      setSidePanelClient(await session.createSidePanelClient());
    })();
  }, []);


  return (
    <section className="p-5 h-screen flex flex-col">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl flex flex-grow flex-col justify-center">
        {user && (
          <>
          <div className="rounded-2xl border border-ink/10 bg-haze/60 p-4 mb-5">
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img className="h-10 w-10 rounded-full" src={user.picture} alt={user.name ?? "User"} />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean/10 text-sm font-semibold text-ocean">
                  {(user?.name ?? "U").slice(0, 1)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-ink">{user?.name}</p>
                {user?.email ? <p className="text-xs text-ink/60">{user.email}</p> : null}
              </div>
            </div>
          </div>
          <button type="button" onClick={startActivity} className="bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-2xl w-full">
            Start Activity
          </button>
          </>
        )}

        {!user && (
          <div>
            <div ref={googleButtonRef} />
          </div>
        )}
      </div>
    </section>
  );
}
