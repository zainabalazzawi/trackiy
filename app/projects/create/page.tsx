"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@/app/hooks/useProjects";

const CreateProject = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const { createProject, isCreating } = useCreateProject();

  const handleCreateProject = async () => {
    try {
      const project = await createProject({
        name: projectName,
        key: projectKey,
      });
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <Button
        variant="ghost"
        onClick={() => router.push("/projects")}
        className="my-6 ml-6 text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to projects
      </Button>

      <div className="mx-auto w-[80%] max-w-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Create project</h1>
        <p className="text-gray-500 mb-8">
          Give your project a name and key to get started.
        </p>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Name *</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Try a team name, project goal, or inspiring idea"
            />
          </div>

          <div>
            <Label className="mb-2">Key *</Label>
            <Input
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={() => router.push("/projects")}>
            Cancel
          </Button>
          <Button
            disabled={!projectName || !projectKey || isCreating}
            onClick={handleCreateProject}
          >
            Create project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
