import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: string | null;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const getBadgeStyles = (plan: string | null): string => {
    switch (plan) {
      case "DIGITAL":
        return "bg-slate-200 text-slate-800 hover:bg-slate-300";
      case "ZAPOY":
        return "bg-orange-600 text-white hover:bg-orange-700";
      case "COACHING":
        return "bg-yellow-500 text-black hover:bg-yellow-600";
      default:
        return "";
    }
  };

  if (!plan) {
    return (
      <Badge variant="outline" className={className}>
        None
      </Badge>
    );
  }

  return (
    <Badge className={cn(getBadgeStyles(plan), className)}>
      {plan}
    </Badge>
  );
}

