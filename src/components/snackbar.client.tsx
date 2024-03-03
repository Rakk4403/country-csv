"use client";

import { createContext, useContext, useState } from "react";
import Snackbar from "./Snackbar";

type Severity = "info" | "success" | "warning" | "error";

type SnackbarContextType = {
  showSnackbar: (message: string, severity?: Severity) => void;
  open: boolean;
  message: string;
  severity: Severity;
};

const SnackbarContext = createContext<SnackbarContextType | null>(null);

type SnackbarProviderProps = {
  children: React.ReactNode;
};

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("success");

  const showSnackbar = (message: string, severity: Severity = "success") => {
    setMessage(message);
    severity ? setSeverity(severity) : setSeverity("success");
    setOpen(true);
    setTimeout(() => setOpen(false), 3000); // 자동으로 닫힘
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, open, message, severity }}>
      {children}
      <Snackbar message={message} severity={severity} open={open} />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("SnackBar Context failed!");
  }
  return context;
};
