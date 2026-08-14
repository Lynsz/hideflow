import { cn } from "@/lib/utils";

export function FormFeedback({
  kind,
  message,
}: {
  kind: "success" | "error";
  message: string;
}) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border p-3 text-sm",
        kind === "error"
          ? "border-red-400/20 bg-red-400/5 text-red-300"
          : "border-accent/20 bg-accent/5 text-accent",
      )}
    >
      {message}
    </p>
  );
}
