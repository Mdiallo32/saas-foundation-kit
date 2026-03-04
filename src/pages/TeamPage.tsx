import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CollaboratorList from "@/components/team/CollaboratorList";
import CollaboratorModal from "@/components/team/CollaboratorModal";
import { useTeam, useUser } from "@/data/hooks";
import { Collaborator, isAdminRole } from "@/types";

const TeamPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | undefined>();
  const { data: collaborators } = useTeam();
  const { data: user } = useUser();
  const isAdmin = isAdminRole(user.role);

  const handleAdd = () => {
    setSelectedCollaborator(undefined);
    setModalOpen(true);
  };

  const handleEdit = (c: Collaborator) => {
    setSelectedCollaborator(c);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {collaborators.length} collaborators
            {!isAdmin && <span className="ml-3 font-normal opacity-80 text-xs italic">Only admins can edit team members.</span>}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Collaborator
          </Button>
        )}
      </div>

      <CollaboratorList collaborators={collaborators} onEdit={isAdmin ? handleEdit : undefined} />
      <CollaboratorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        collaborator={selectedCollaborator}
      />
    </div>
  );
};

export default TeamPage;
