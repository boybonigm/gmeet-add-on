import { useEffect, useRef, useState } from "react";
import { meet, MeetingInfo, MeetMainStageClient } from '@googleworkspace/meet-addons/meet.addons';

export default function MainStage() {
  const [mainStageClient, setMainStageClient] = useState<MeetMainStageClient>();
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [invitees, setInvitees] = useState<
    Array<{ email: string; name?: string; responseStatus?: string }>
  >([]);
  const [additionalData, setAdditionalData] = useState<string | undefined>(undefined);

  const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null);

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
      if (google?.accounts?.oauth2) {
        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "openid"
          ].join(" "),
          callback: (response) => {
            if (response.error) {
              setAuthError(response.error);
              return;
            }

            setAccessToken(response.access_token);
            setAuthError(null);
          }
        });
        return;
      }

      attempts += 1;
      if (attempts < 10) {
        setTimeout(tryInit, 250);
      } else {
        setAuthError("Google OAuth failed to load.");
      }
    };

    tryInit();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignIn = () => {
    if (!tokenClientRef.current) {
      setAuthError("OAuth client is not ready yet.");
      return;
    }

    tokenClientRef.current.requestAccessToken({ prompt: "consent" });
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
          throw new Error(`Profile fetch failed (${response.status})`);
        }

        const profile = (await response.json()) as {
          name?: string;
          email?: string;
          picture?: string;
        };

        setUser({
          name: profile.name ?? "Signed in user",
          email: profile.email ?? "unknown",
          picture: profile.picture ?? ""
        });
      } catch (error) {
        setAuthError((error as Error).message);
      }
    };

    fetchProfile();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !meetingInfo?.meetingCode) {
      return;
    }

    const fetchInvitees = async () => {
      setCalendarError(null);
      setInvitees([]);

      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const meetUrl = `https://meet.google.com/${meetingInfo.meetingCode}`;
      const matchMeeting = (item: {
        hangoutLink?: string;
        conferenceData?: { entryPoints?: Array<{ uri?: string }> };
      }) => {
        return item.hangoutLink === meetUrl;
      };

      try {
        const calendarListResponse = await fetch(
          "https://www.googleapis.com/calendar/v3/users/me/calendarList",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!calendarListResponse.ok) {
          throw new Error(`Calendar list fetch failed (${calendarListResponse.status})`);
        }

        const calendarListData = (await calendarListResponse.json()) as {
          items?: Array<{ id: string; summary?: string }>;
        };

        const calendars = calendarListData.items ?? [];
        let foundAttendees: Array<{
          email: string;
          displayName?: string;
          responseStatus?: string;
        }> = [];

        for (const calendar of calendars) {
          if (calendar.id === user?.email) {
            const encodedCalendarId = encodeURIComponent(calendar.id);
            const qParam = encodeURIComponent(meetUrl);
            const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events`;
            const queryUrl = `${baseUrl}?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&q=${qParam}&maxResults=250`;

            const response = await fetch(queryUrl, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) {
              continue;
            }

            const data = (await response.json()) as {
              items?: Array<{
                hangoutLink?: string;
                conferenceData?: {
                  entryPoints?: Array<{ uri?: string }>;
                };
                attendees?: Array<{
                  email: string;
                  displayName?: string;
                  responseStatus?: string;
                }>;
              }>;
            };

            let match = data.items?.find(matchMeeting);
            if (!match) {
              const fallbackUrl = `${baseUrl}?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&maxResults=250&orderBy=startTime`;
              const fallbackResponse = await fetch(fallbackUrl, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });

              if (fallbackResponse.ok) {
                const fallbackData = (await fallbackResponse.json()) as {
                  items?: Array<{
                    hangoutLink?: string;
                    conferenceData?: {
                      entryPoints?: Array<{ uri?: string }>;
                    };
                    attendees?: Array<{
                      email: string;
                      displayName?: string;
                      responseStatus?: string;
                    }>;
                  }>;
                };

                match = fallbackData.items?.find(matchMeeting);
              }
            }

            if (match?.attendees?.length) {
              foundAttendees = match.attendees;
              break;
            }
          }
        }

        setInvitees(
          foundAttendees.map((attendee) => ({
            email: attendee.email,
            name: attendee.displayName,
            responseStatus: attendee.responseStatus
          }))
        );
      } catch (error) {
        setCalendarError((error as Error).message);
      }
    };

    fetchInvitees();
  }, [accessToken, meetingInfo]);

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

        {!user && (
          <button
            type="button"
            onClick={handleSignIn}
            className="rounded-full border border-ink/10 bg-white/90 px-4 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-ink/30"
          >
            Sign in with Google
          </button>
        )}

      </nav>
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Google Meet ID</p>
        <h2 className="font-display text-2xl font-semibold text-ink">{meetingInfo?.meetingId || "Loading..."}</h2>
        <hr className="my-5" />
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Google Meet CODE</p>
        <h2 className="font-display text-2xl font-semibold text-ink">{meetingInfo?.meetingCode || "Loading..."}</h2>
      </div>

      <div className="mt-6 rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Invitees (Calendar)</p>
        {authError ? (
          <p className="mt-3 text-sm text-coral">{authError}</p>
        ) : calendarError ? (
          <p className="mt-3 text-sm text-coral">{calendarError}</p>
        ) : !accessToken ? (
          <p className="mt-3 text-sm text-ink/70">Sign in to load invitees from Calendar.</p>
        ) : invitees.length === 0 ? (
          <p className="mt-3 text-sm text-ink/70">No invitees found for this meeting yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {invitees.map((invitee) => (
              <li key={invitee.email} className="rounded-2xl border border-ink/10 bg-haze/60 p-3">
                <p className="text-sm font-semibold text-ink">{invitee.name ?? invitee.email}</p>
                <p className="text-xs text-ink/60">{invitee.email}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
