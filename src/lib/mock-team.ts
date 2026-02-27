export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  matterIds: string[];
}

export const mockCollaborators: Collaborator[] = [
  { id: "u1", name: "Sarah Chen", email: "s.chen@firm.com", role: "Senior Partner", matterIds: ["m1", "m5"] },
  { id: "u2", name: "James Okafor", email: "j.okafor@firm.com", role: "Associate", matterIds: ["m1", "m4"] },
  { id: "u3", name: "Emily Tran", email: "e.tran@firm.com", role: "Associate", matterIds: ["m1", "m7"] },
  { id: "u4", name: "David Kimura", email: "d.kimura@firm.com", role: "Junior Associate", matterIds: ["m2"] },
  { id: "u5", name: "Maria Lopez", email: "m.lopez@firm.com", role: "Paralegal", matterIds: ["m3", "m6"] },
];
