import React from "react";
import Routes from "./Routes";
import { AchievementProvider } from "./contexts/AchievementContext";

function App() {
  return (
    <AchievementProvider>
      <Routes />
    </AchievementProvider>
  );
}

export default App;
