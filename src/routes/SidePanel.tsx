import { useEffect, useState } from "react";
import {
  meet,
  MeetSidePanelClient,
} from '@googleworkspace/meet-addons/meet.addons';

export default function SidePanel() {
  const [sidePanelClient, setSidePanelClient] = useState<MeetSidePanelClient>();

  // Launches the main stage when the main button is clicked.
  async function startActivity() {

    if (!sidePanelClient) {
      return;
    }

    const payload = {
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
    <section className="p-5 h-screen flex flex-col">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl flex flex-grow flex-col justify-center">
          <button type="button" onClick={startActivity} className="bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-2xl w-full">
            Start Activity
          </button>
      </div>
    </section>
  );
}
