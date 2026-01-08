import { useEffect, useState } from "react";
import { createMessageChannel, SidePanelPayload } from "../components/messageBus";

const fallbackMessage: SidePanelPayload = {
  sender: "Side panel",
  message: "Waiting for input from the side panel...",
  submittedAt: new Date().toISOString()
};

export default function MainStage() {
  const [latestPayload, setLatestPayload] = useState<SidePanelPayload>(fallbackMessage);

  useEffect(() => {
    const channel = createMessageChannel();

    channel.onmessage = (event) => {
      if (!event.data) {
        return;
      }

      setLatestPayload(event.data as SidePanelPayload);
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Main Stage</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          Live content from the side panel
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          This area simulates what a participant sees on the shared main stage.
        </p>

        <div className="mt-6 rounded-2xl border border-ink/10 bg-haze/50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Latest submission</p>
          <p className="mt-3 text-lg font-semibold text-ink">{latestPayload.message}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink/60">
            <span className="rounded-full bg-white px-3 py-1">From: {latestPayload.sender}</span>
            <span className="rounded-full bg-white px-3 py-1">
              {new Date(latestPayload.submittedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-ink p-6 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Environment</p>
        <h3 className="mt-3 font-display text-xl font-semibold">Add-on configuration</h3>
        <ul className="mt-4 space-y-3 text-sm text-white/80">
          <li>
            <span className="text-white/50">Client ID</span>
            <div className="mt-1 break-all font-medium text-white">
              {import.meta.env.VITE_GOOGLE_MEET_ADDON_CLIENT_ID}
            </div>
          </li>
          <li>
            <span className="text-white/50">Project ID</span>
            <div className="mt-1 break-all font-medium text-white">
              {import.meta.env.VITE_GOOGLE_MEET_ADDON_PROJECT_ID}
            </div>
          </li>
          <li>
            <span className="text-white/50">Deployment ID</span>
            <div className="mt-1 break-all font-medium text-white">
              {import.meta.env.VITE_GOOGLE_MEET_ADDON_DEPLOYMENT_ID}
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
