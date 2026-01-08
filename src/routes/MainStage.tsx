import { useEffect, useState } from "react";
import { meet, MeetMainStageClient } from '@googleworkspace/meet-addons/meet.addons';


export default function MainStage() {
  const [mainStageClient, setMainStageClient] = useState<MeetMainStageClient>();
  const [additionalData, setAdditionalData] = useState<string | undefined>(undefined);

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
      const activityStartingState = await mainStage.getActivityStartingState();

      setAdditionalData(activityStartingState.additionalData);
      setMainStageClient(mainStage);
    })();
  }, []);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Main Stage</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
          Live content from the side panel
        </h2>
        <pre className="mt-2 text-sm text-ink/70">
          {additionalData}
        </pre>
      </div>
    </section>
  );
}
