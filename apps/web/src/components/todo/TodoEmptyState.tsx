import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TodoEmptyStateProps = {
  title: string;
  message: string;
  tone?: "muted" | "destructive";
};

export function TodoEmptyState({ title, message, tone = "muted" }: TodoEmptyStateProps) {
  return (
    <Card className={cn("border-dashed", tone === "destructive" && "border-destructive")}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}
