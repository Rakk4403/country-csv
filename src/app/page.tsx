"use client";

import CountryContinent from "@/components/continent.client";
import { SnackbarProvider, useSnackbar } from "../components/snackbar.client";

export default function Home() {
  const snackbar = useSnackbar();
  return (
    <div className="w-full sm:w-4/5">
      <SnackbarProvider>
        <CountryContinent />
      </SnackbarProvider>
    </div>
  );
}
