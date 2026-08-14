import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
      <span className="bg-muted grid size-10 place-items-center rounded-lg">
        <Inbox className="text-muted-foreground size-4" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-xs text-xs leading-5">
        {description}
      </p>
    </div>
  );
}
