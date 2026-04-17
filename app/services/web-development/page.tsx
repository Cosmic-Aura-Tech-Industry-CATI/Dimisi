import ServiceDetailView from "@/components/services/ServiceDetailView";
import { SERVICE_PROFILES } from "@/app/services/_service-data";

export default function WebDevelopmentServicePage() {
  return <ServiceDetailView profile={SERVICE_PROFILES["web-development"]} />;
}