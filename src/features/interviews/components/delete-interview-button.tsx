"use client";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { deleteInterview } from "@/features/interviews/actions";
export function DeleteInterviewButton({
  interviewId,
  applicationId,
}: {
  interviewId: string;
  applicationId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (
      !window.confirm(
        "Excluir esta entrevista? A candidatura e os eventos já registrados serão preservados.",
      )
    )
      return;
    setPending(true);
    const result = await deleteInterview(interviewId, applicationId);
    setPending(false);
    if (!result.success) return setError(result.message);
    router.replace(result.redirectTo!);
    router.refresh();
  }
  return (
    <div>
      <button
        className={buttonStyles({ variant: "ghost", size: "sm" })}
        type="button"
        disabled={pending}
        onClick={remove}
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Excluir
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
