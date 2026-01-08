import { FormEvent, useEffect, useMemo, useState } from "react";
import { createMessageChannel, SidePanelPayload } from "../components/messageBus";

const quickPrompts = [
  "Welcome everyone! Let's align on the agenda.",
  "Drop your top priority for today.",
  "Share one win from the week."
];

export default function SidePanel() {
  const [sender, setSender] = useState("Side panel");
  const [message, setMessage] = useState(quickPrompts[0]);
  const [status, setStatus] = useState("Idle");

  const channel = useMemo(() => createMessageChannel(), []);

  useEffect(() => {
    return () => {
      channel.close();
    };
  }, [channel]);

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: SidePanelPayload = {
      sender: sender.trim() || "Side panel",
      message: message.trim() || "(empty message)",
      submittedAt: new Date().toISOString()
    };

    channel.postMessage(payload);
    setStatus(`Sent at ${new Date(payload.submittedAt).toLocaleTimeString()}`);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Side Panel</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">Send content to main stage</h2>
        <p className="mt-2 text-sm text-ink/70">
          This simulates the side panel experience in a Google Meet add-on.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={submitMessage}>
          <label className="text-sm font-medium text-ink/80">
            Sender label
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:border-ocean focus:outline-none"
              value={sender}
              onChange={(event) => setSender(event.target.value)}
            />
          </label>

          <label className="text-sm font-medium text-ink/80">
            Message for main stage
            <textarea
              className="mt-2 min-h-[140px] w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:border-ocean focus:outline-none"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setMessage(prompt)}
                className="rounded-full border border-ink/10 bg-haze px-3 py-1 text-xs font-medium text-ink/70 transition hover:border-ink/30"
              >
                {prompt}
              </button>
            ))}
          </div>

          <button
            className="mt-2 rounded-2xl bg-ocean px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink"
            type="submit"
          >
            Send to main stage
          </button>
        </form>
      </div>

      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Status</p>
        <h3 className="mt-3 font-display text-xl font-semibold text-ink">Channel activity</h3>
        <p className="mt-2 text-sm text-ink/70">BroadcastChannel: gmeet-poc-channel</p>
        <div className="mt-5 rounded-2xl border border-ink/10 bg-haze/60 p-4">
          <p className="text-sm font-medium text-ink">{status}</p>
          <p className="mt-2 text-xs text-ink/60">
            Tip: open the main stage in another tab to see live updates.
          </p>
        </div>
      </div>
    </section>
  );
}
