import { Card } from "@/components/ui/card";

export function PageFrame({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary">NutriTrack</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">{description}</p>
        </div>
        {actions}
      </div>
      <Card className="p-0">{children}</Card>
    </div>
  );
}

