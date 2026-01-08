import { useEffect, useState } from "react";
import {
  meet,
  MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';

const quickPrompts = [
  "Welcome everyone! Let's align on the agenda.",
  "Drop your top priority for today.",
  "Share one win from the week."
];

export default function SidePanel() {
  const [sender, setSender] = useState("Side panel");
  const [message, setMessage] = useState(quickPrompts[0]);
  const [sidePanelClient, setSidePanelClient] = useState<MeetSidePanelClient>();


  // Launches the main stage when the main button is clicked.
  async function startActivity(event: React.FormEvent<HTMLFormElement>) {
    if (!sidePanelClient) {
      throw new Error('Side Panel is not yet initialized!');
    }

    event.preventDefault();

    const payload = {
      sender: sender.trim() || "Side panel",
      message: message.trim() || "(empty message)",
      submittedAt: new Date().toISOString()
    };

    await sidePanelClient.startActivity({
      mainStageUrl: import.meta.env.VITE_MAIN_STAGE_URL,
      additionalData: JSON.stringify(payload),
    });
  }

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
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Side Panel</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">Send content to main stage</h2>
        <p className="mt-2 text-sm text-ink/70">
          This simulates the side panel experience in a Google Meet add-on.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={startActivity}>
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
            Start Activity
          </button>
        </form>
      </div>
    </section>
  );
}
