import { ServiceWorldPage } from "@/components/services/ServiceWorldPage/ServiceWorldPage";
import { worldBySlug } from "@/data/serviceWorlds";
const world = worldBySlug("ui-ux")!;

export function ServiceWorldRoute() {
  return <ServiceWorldPage world={world} />;
}
