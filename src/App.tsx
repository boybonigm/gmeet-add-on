import { Route, Routes } from "react-router-dom";
import MainStage from "./routes/MainStage";
import SidePanel from "./routes/SidePanel";


export default function App() {
  return (
    <div className="min-h-screen app-shell">

        <Routes>
          <Route path="/" element={<MainStage />} />
          <Route path="/sidepanel" element={<SidePanel />} />
        </Routes>
    </div>
  );
}
