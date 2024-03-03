type SnackbarProps = {
  open: boolean;
  message: string;
  severity: "error" | "warning" | "success" | "info";
};

const Snackbar = ({ open, message, severity }: SnackbarProps) => {
  console.log(open, message, severity);
  if (!open) return null;
  return (
    <div
      style={{
        backgroundColor:
          severity === "error"
            ? "red"
            : severity === "warning"
            ? "yellow"
            : "green",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        position: "fixed",
        bottom: "10px",
        left: "10px",
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
};
export default Snackbar;
