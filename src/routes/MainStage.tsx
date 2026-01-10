import { useEffect, useRef, useState } from "react";
import { meet, MeetingInfo, MeetMainStageClient } from '@googleworkspace/meet-addons/meet.addons';
import { decodeJwtPayload } from "../utils/jwt";


export default function MainStage() {
  const [mainStageClient, setMainStageClient] = useState<MeetMainStageClient>();
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [additionalData, setAdditionalData] = useState<string | undefined>(undefined);

  const googleButtonRef = useRef<HTMLDivElement | null>(null);

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
   * Prepares the add-on Main Stage Client, which signals that the add-on
   * has successfully launched in the main stage.
   */
  useEffect(() => {
    (async () => {
      const session = await meet.addon.createAddonSession({
        cloudProjectNumber: import.meta.env.VITE_GOOGLE_PROJECT_NUMBER,
      });

      const mainStage = await session.createMainStageClient();
      const meetingInfo = await mainStage.getMeetingInfo();
      const activityStartingState = await mainStage.getActivityStartingState();

      setMainStageClient(mainStage);
      setMeetingInfo(meetingInfo);
      setAdditionalData(activityStartingState.additionalData);
    })();
  }, []);

  console.log(user);

  return (
    <section className="p-5 min-h-screen flex flex-col">
      <nav className="flex flex-row justify-between items-center gap-5 mb-5">
        <h1 className="font-display text-3xl font-bold text-ink">TeamRetro</h1>

        {user && (
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
        )}

        {!user && <div><div ref={googleButtonRef} /></div>}

      </nav>
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Google Meet ID</p>
        <h2 className="font-display text-2xl font-semibold text-ink">{meetingInfo?.meetingId || "Loading..."}</h2>
        <hr className="my-5" />
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Google Meet CODE</p>
        <h2 className="font-display text-2xl font-semibold text-ink">{meetingInfo?.meetingCode || "Loading..."}</h2>
      </div>
    </section>
  );
}
