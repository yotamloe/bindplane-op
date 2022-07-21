import { useParams } from "react-router-dom";
import { LiveTailConsole } from "../../components/LiveTailConsole/LiveTailConsole";
import { withNavBar } from "../../components/NavBar";
import { withRequireLogin } from "../../contexts/RequireLogin";

export const LiveTailPageComponent: React.FC = () => {
  const { id } = useParams();
  if (id == null) return null;

  return <LiveTailConsole ids={[id]} />;
};

export const LiveTailPage = withRequireLogin(withNavBar(LiveTailPageComponent));
