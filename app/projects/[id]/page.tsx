"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Board from "@/app/components/Board";
import Members from "@/app/components/Members";
import { MemberSelection } from "../../types";
import { use } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/app/components/LoadingState";
import { useProject } from "@/app/hooks/useProjects";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const { project, isLoading } = useProject(resolvedParams.id);

  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<MemberSelection>(null);

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      await axios.post(`/api/projects/${project?.id}/invite`, { email });
    },
    onSuccess: () => {
      setInviteEmail("");
      setOpen(false);
    },
  });

  const handleInviteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    inviteMutation.mutate(inviteEmail);
  };

  if (isLoading)
    return (
        <LoadingState
          text="Loading project details"
          iconSize={64}
          className="animate-spin text-[#649C9E]"
        />
    );
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="mb-6 flex items-center gap-2">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-3">
            <Members
              projectId={resolvedParams.id}
              selectedMemberId={selectedMemberId}
              onMemberSelect={setSelectedMemberId}
            />

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full p-4"
                  size="icon"
                >
                  <UserPlus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Add people to {project.name} project
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">add email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      className="bg-[#f4f4f5] text-[#27272a] hover:bg-[#e4e4e7] cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] cursor-pointer"
                      disabled={inviteMutation.isPending || !inviteEmail}
                      type="submit"
                    >
                      {inviteMutation.isPending ? "adding..." : "add"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-gray-600">Key: {project.key}</p>
      </div>
      <Board
        projectId={resolvedParams.id}
        selectedMemberId={selectedMemberId}
      />
    </div>
  );
}
