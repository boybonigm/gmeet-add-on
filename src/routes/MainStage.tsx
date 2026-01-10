import { useEffect, useState } from "react";
import { meet, MeetingInfo, MeetMainStageClient } from '@googleworkspace/meet-addons/meet.addons';


export default function MainStage() {
  const [mainStageClient, setMainStageClient] = useState<MeetMainStageClient>();
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>();
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
      const meetingInfo = await mainStage.getMeetingInfo();
      const activityStartingState = await mainStage.getActivityStartingState();
      
      setMainStageClient(mainStage);
      setMeetingInfo(meetingInfo);
      setAdditionalData(activityStartingState.additionalData);
    })();
  }, []);

  return (
    <section className="p-5">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Meeting ID</p>
        <h2 className="font-display text-2xl font-semibold text-ink">{meetingInfo?.meetingId || "Loading..."}</h2>
        <hr className="my-5" />
        <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Meeting CODE</p>
        <h2 className="font-display text-2xl font-semibold text-ink">{meetingInfo?.meetingCode || "Loading..."}</h2>
      </div>
    </section>
  );
}
