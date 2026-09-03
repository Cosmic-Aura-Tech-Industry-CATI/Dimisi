import { ServiceWorldPage } from "@/components/services/ServiceWorldPage/ServiceWorldPage";
import { worldBySlug } from "@/data/serviceWorlds";
const world = worldBySlug("mobile-app")!;

export function ServiceWorldRoute() {
  return <ServiceWorldPage world={world} />;
}
