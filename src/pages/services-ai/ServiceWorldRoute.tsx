import { ServiceWorldPage } from "@/components/services/ServiceWorldPage/ServiceWorldPage";
import { worldBySlug } from "@/data/serviceWorlds";
const world = worldBySlug("ai")!;

export function ServiceWorldRoute() {
  return <ServiceWorldPage world={world} />;
}
