import { FullPageLoader } from "@/components/ui/FullPageLoader";

export default function Loading() {
  return (
    <FullPageLoader
      title="Prime Account"
      message="Initializing workspace..."
      subtitle="Preparing modules and connecting to cloud services"
    />
  );
}
