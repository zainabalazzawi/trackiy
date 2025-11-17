"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Board from "@/app/components/Board";
import Members from "@/app/components/Members";
import { MemberSelection } from "../../types";
import { use, useEffect } from "react";
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
import useRecentProjectsStore from "@/app/stores/recentProjectsStore";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const { project, isLoading } = useProject(resolvedParams.id);
  const addProject = useRecentProjectsStore((state) => state.addProject);

  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<MemberSelection>(null);

  // Track project visit for recent projects
  useEffect(() => {
    if (project) {
      addProject(project);
    }
  }, [project, addProject]);

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
    <div className="p-3 sm:p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="mb-4 sm:mb-6 max-w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-gradient-to-br from-white via-slate-50/30 to-white p-3 rounded-xl shadow-lg border border-slate-200/80 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">{project.name}</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Key: <span className="font-semibold text-[#649C9E]">{project.key}</span></p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Members
            projectId={resolvedParams.id}
            selectedMemberId={selectedMemberId}
            onMemberSelect={setSelectedMemberId}
          />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full p-3 sm:p-4 border-[#649C9E] hover:bg-gradient-to-r hover:from-[#649C9E] hover:to-[#527f81] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                size="icon"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md shadow-2xl border-slate-200/80 bg-gradient-to-br from-white to-slate-50/30">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-bold text-slate-800">
                  Add people to {project.name} project
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email" className="text-sm sm:text-base font-medium">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="text-sm sm:text-base border-slate-300"
                  />
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 cursor-pointer w-full sm:w-auto border border-slate-300 transition-all duration-200"
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#649C9E] to-[#527f81] text-white hover:from-[#527f81] hover:to-[#3d6061] cursor-pointer w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300"
                    disabled={inviteMutation.isPending || !inviteEmail}
                    type="submit"
                  >
                    {inviteMutation.isPending ? "Adding..." : "Add Member"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Board
        projectId={resolvedParams.id}
        selectedMemberId={selectedMemberId}
      />
    </div>
  );
}
