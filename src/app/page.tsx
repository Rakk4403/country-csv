import CountryContinent from "@/components/continent.client";
import { SnackbarProvider } from "../components/snackbar.client";

export default function Home() {
  return (
    <div className="w-full sm:w-4/5">
      <SnackbarProvider>
        <CountryContinent />
      </SnackbarProvider>
    </div>
  );
}
