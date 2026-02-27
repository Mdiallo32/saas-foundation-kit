import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { mockMatters } from "@/lib/mock-matters";

interface MatterAssignmentsProps {
  matterIds: string[];
  onAdd?: (matterId: string) => void;
  onRemove?: (matterId: string) => void;
}

const MatterAssignments = ({ matterIds, onAdd, onRemove }: MatterAssignmentsProps) => {
  const assigned = mockMatters.filter((m) => matterIds.includes(m.id));
  const available = mockMatters.filter((m) => !matterIds.includes(m.id) && m.status !== "closed");

  return (
    <div className="space-y-2">
      {/* Chips */}
      <div className="flex flex-wrap gap-1.5">
        {assigned.length === 0 && (
          <span className="text-xs text-muted-foreground">No matters assigned</span>
        )}
        {assigned.map((m) => (
          <Badge key={m.id} variant="secondary" className="gap-1 pr-1 text-xs">
            {m.title}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                aria-label={`Remove ${m.title}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {/* Add select */}
      {available.length > 0 && onAdd && (
        <Select onValueChange={onAdd}>
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue placeholder="Assign matter…" />
          </SelectTrigger>
          <SelectContent>
            {available.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-xs">
                {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default MatterAssignments;
