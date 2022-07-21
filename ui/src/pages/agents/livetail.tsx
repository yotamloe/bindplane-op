import { LiveTailConsole } from "../../components/LiveTailConsole/LiveTailConsole";
import { withNavBar } from "../../components/NavBar";
import { withRequireLogin } from "../../contexts/RequireLogin";

export const LiveTailPageComponent: React.FC = () => {
  return <LiveTailConsole />;
};

export const LiveTailPage = withRequireLogin(withNavBar(LiveTailPageComponent));
