import { Link, Route, Routes } from "react-router-dom";
import MainStage from "./routes/MainStage";
import SidePanel from "./routes/SidePanel";

const appName = import.meta.env.VITE_APP_NAME || "GMeet PoC";

export default function App() {
  return (
    <div className="min-h-screen app-shell">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-lg backdrop-blur">
          <p className="text-xs uppercase tracking-[0.4em] text-ink/70">Google Meet Add-on</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                {appName}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-ink/70">
                Proof of concept with a main stage and side panel view, connected through a shared
                BroadcastChannel.
              </p>
            </div>
            <nav className="flex gap-3 text-sm font-medium">
              <Link
                className="rounded-full border border-ink/10 bg-white/90 px-4 py-2 transition hover:-translate-y-0.5 hover:border-ink/30"
                to="/mainstage"
              >
                Main Stage
              </Link>
              <Link
                className="rounded-full border border-ink/10 bg-white/90 px-4 py-2 transition hover:-translate-y-0.5 hover:border-ink/30"
                to="/sidepanel"
              >
                Side Panel
              </Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<MainStage />} />
          <Route path="/mainstage" element={<MainStage />} />
          <Route path="/sidepanel" element={<SidePanel />} />
        </Routes>
      </div>
    </div>
  );
}
