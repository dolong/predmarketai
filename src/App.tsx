import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { Overview } from "./pages/Overview";
import { Markets } from "./pages/Markets";
import { ManageQuestions } from "./pages/ManageQuestions";
import { ResolveScore } from "./pages/ResolveScore";
import { AnswersExplorer } from "./pages/AnswersExplorer";
import { Agents } from "./pages/Agents";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { TwitterSettings } from "./pages/TwitterSettings";
import { NewsSettings } from "./pages/NewsSettings";
import { TelegramSettings } from "./pages/TelegramSettings";
import { DiscordSettings } from "./pages/DiscordSettings";
import { RedditSettings } from "./pages/RedditSettings";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState("overview");

  const renderPage = () => {
    const props = { onNavigate: setCurrentPage };
    
    switch (currentPage) {
      case "overview":
        return <Overview {...props} />;
      case "markets":
        return <Markets {...props} />;
      case "questions":
        return <ManageQuestions {...props} />;
      case "resolve":
        return <ResolveScore {...props} />;
      case "answers":
        return <AnswersExplorer {...props} />;
      case "agents":
        return <Agents {...props} />;
      case "reports":
        return <Reports {...props} />;
      case "settings":
        return <Settings {...props} />;
      case "sources/twitter":
        return <TwitterSettings {...props} />;
      case "sources/news":
        return <NewsSettings {...props} />;
      case "sources/telegram":
        return <TelegramSettings {...props} />;
      case "sources/discord":
        return <DiscordSettings {...props} />;
      case "sources/reddit":
        return <RedditSettings {...props} />;
      default:
        return <Overview {...props} />;
    }
  };

  return (
    <>
      <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppShell>
      <Toaster />
    </>
  );
}