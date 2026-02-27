import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import MatterAssignments from "@/components/team/MatterAssignments";
import type { Collaborator } from "@/lib/mock-team";

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const CollaboratorList = ({ collaborators }: { collaborators: Collaborator[] }) => {
  const [assignments, setAssignments] = useState<Record<string, string[]>>(
    Object.fromEntries(collaborators.map((c) => [c.id, [...c.matterIds]])),
  );

  const handleAdd = (userId: string, matterId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] ?? []), matterId],
    }));
  };

  const handleRemove = (userId: string, matterId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [userId]: (prev[userId] ?? []).filter((id) => id !== matterId),
    }));
  };

  if (collaborators.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No team members yet.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {collaborators.map((c) => (
        <Card key={c.id}>
          <CardContent className="pt-5 pb-4 px-5 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {initials(c.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.role} · ${c.hourlyRate}/hr</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{c.email}</span>
            </div>

            <div className="pt-1 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">Matter Assignments</p>
              <MatterAssignments
                matterIds={assignments[c.id] ?? []}
                onAdd={(mid) => handleAdd(c.id, mid)}
                onRemove={(mid) => handleRemove(c.id, mid)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CollaboratorList;
