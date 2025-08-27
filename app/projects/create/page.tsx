"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InfoCard from "@/app/components/InfoCard";
import { useCreateProject } from "@/app/hooks/useProjects";

export type ProjectCategory = "SOFTWARE" | "SERVICE" | null;
export type TemplateType = "KANBAN" | "CUSTOMER_SERVICE" | null;
export type ProjectType = "TEAM_MANAGED" | "COMPANY_MANAGED" | null;

const CreateProject = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [projectType, setProjectType] = useState<ProjectType>(null);
  const [projectName, setProjectName] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const { createProject, isCreating } = useCreateProject();

  const getTemplateInfo = () => {
    if (selectedTemplate === "KANBAN") {
      return {
        title: "Kanban",
        description:
          "Visualise and advance your project forward using issues on a powerful board.",
      };
    }
    return {
      title: "Customer service management",
      description:
        "Deliver great service experiences fast with a template designed to help your external customers.",
    };
  };
  const getTProjectType = () => {
    if (projectType === "TEAM_MANAGED") {
      return {
        title: "Team-managed",
        description:
          "Control your own working processes and practices in a self-contained space.",
      };
    }
    return {
      title: "Company-managed",
      description:
        "Work with other teams across many projects in a standard way.",
    };
  };
  const templateInfo = getTemplateInfo();
  const projectTypeInfo = getTProjectType();

  const handleCreateProject = async () => {
    try {
      await createProject({
        name: projectName,
        key: projectKey,
        type:
          projectType === "TEAM_MANAGED" ? "TEAM_MANAGED" : "COMPANY_MANAGED",
        template: selectedTemplate === "KANBAN" ? "KANBAN" : "CUSTOMER_SERVICE",
        category: selectedCategory === "SOFTWARE" ? "SOFTWARE" : "SERVICE",
        memberIds: [], 
      });
      router.push("/projects");
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  if (showProjectDetails) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <Button
          variant="ghost"
          onClick={() => setShowProjectDetails(false)}
          className="my-6 ml-6 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to project types
        </Button>

        <div className="flex flex-row mx-auto w-[80%] gap-4">
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-2">Add project details</h1>
            <p className="text-gray-500 mb-8">
              Explore what's possible when you collaborate with your team. Edit
              project details anytime in project settings.
            </p>

            <div className="flex gap-8">
              <div className="space-y-4 w-[70%]">
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
                    onChange={(e) =>
                      setProjectKey(e.target.value.toUpperCase())
                    }
                    className="uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[40%]">
            <InfoCard
              title={templateInfo.title}
              description={templateInfo.description}
              changeLabel="Change template"
              label="Template"
            />
            <InfoCard
              title={projectTypeInfo.title}
              description={projectTypeInfo.description}
              changeLabel="Change type"
              label="Type"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 w-[80%] mx-auto">
          <Button variant="outline" onClick={() => router.push("/projects")}>
            Cancel
          </Button>
          <Button
            disabled={!projectName || !projectKey}
            onClick={handleCreateProject}
          >
            Create project
          </Button>
        </div>
      </div>
    );
  }

  // check the step 
  if (showSteps) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <Button
          variant="ghost"
          onClick={() => setShowSteps(false)}
          className="my-6 ml-6 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to project templates
        </Button>
        <div className="p-6 max-w-5xl mx-auto">
          {/* Step 1: Project Template */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-full bg-green-900 text-white flex items-center justify-center text-sm">
                1
              </span>
              <h1 className="text-2xl font-semibold">Project template</h1>
            </div>

            <InfoCard
              title={templateInfo.title}
              description={templateInfo.description}
            />
          </div>

          {/* Step 2: Project Type */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-full bg-green-900 text-white flex items-center justify-center text-sm">
                2
              </span>
              <h1 className="text-2xl font-semibold">Choose a project type</h1>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Team-managed option */}
              <div className="space-y-4">
                <h2 className="text-purple-950 font-medium">Team-managed</h2>
                <p className="text-gray-600">
                  Set up and maintained by your team.
                </p>
                <p className="text-sm text-gray-500">
                  For teams who want to control their own working processes and
                  practices in a self-contained space. Mix and match trackiy
                  features to support your team as you grow in size and
                  complexity.
                </p>
                <Button
                  className="w-full bg-purple-100 text-purple-900 hover:bg-purple-800 hover:text-white"
                  onClick={() => {
                    setProjectType("TEAM_MANAGED");
                    setShowProjectDetails(true);
                  }}
                >
                  Select a team-managed project
                </Button>
              </div>

              {/* Company-managed option */}
              <div className="space-y-4">
                <h2 className="text-blue-900 font-medium">Company-managed</h2>
                <p className="text-gray-600">
                  Set up and maintained by your Trackiy admins.
                </p>
                <p className="text-sm text-gray-500">
                  For teams who want to work with other teams across many
                  projects in a standard way. Encourage and promote
                  organizational best practices and processes through a shared
                  configuration.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-blue-600 text-blue-900 hover:bg-blue-50"
                  onClick={() => {
                    setProjectType("COMPANY_MANAGED");
                    setShowProjectDetails(true);
                  }}
                >
                  Select a company-managed project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-[20%] border-r bg-white">
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.back()}
          >
            <X className="h-4 w-4 mr-2" />
            Project templates
          </Button>
        </div>
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Made for you
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                selectedCategory === "SOFTWARE"
                  ? "bg-blue-50 text-blue-600"
                  : ""
              }`}
              onClick={() => {
                setSelectedCategory("SOFTWARE");
                setSelectedTemplate(null);
              }}
            >
              Software development
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                selectedCategory === "SERVICE" ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={() => {
                setSelectedCategory("SERVICE");
                setSelectedTemplate(null);
              }}
            >
              Service management
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8">
        {selectedCategory && (
          <div className="w-[80%] mx-auto">
            <h1 className="text-2xl font-semibold mb-2">
              {selectedCategory === "SOFTWARE"
                ? "Software development"
                : "Service management"}
            </h1>
            <p className="text-gray-500 mb-8">
              {selectedCategory === "SOFTWARE"
                ? "Plan, track and release great software. Get up and running quickly with templates that suit the way your team works. Plus, integrations for DevOps teams that want to connect work across their entire toolchain."
                : "Empower every team, from IT to HR to marketing, as they collect, prioritize, assign, and track incoming requests with ease. Get up and running quickly by selecting one of our tailored templates that include pre-configured workflows, forms, and settings based on service management best practices."}
            </p>

            <div className="space-y-4">
              {selectedCategory === "SOFTWARE" ? (
                <>
                  <InfoCard
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate === "KANBAN"
                        ? "border-2 border-emerald-950"
                        : "border-2 border-transparent"
                    }`}
                    onClick={() => setSelectedTemplate("KANBAN")}
                    title="Kanban"
                    description="Visualise and advance your project forward using issues on a powerful board."
                  />
                </>
              ) : (
                <>
                  <InfoCard
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate === "CUSTOMER_SERVICE"
                        ? "border-2 border-emerald-950"
                        : "border-2 border-transparent"
                    }`}
                    onClick={() => setSelectedTemplate("CUSTOMER_SERVICE")}
                    title="Customer service management"
                    description="Deliver great service experiences fast with a template
                          designed to help your external customers."
                  />
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                disabled={!selectedTemplate}
                onClick={() => setShowSteps(true)}
              >
                Use template
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProject;
