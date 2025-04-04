"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { Card } from "@/components/ui/card";

type ProjectCategory = "software" | "service" | null;
type TemplateType = "kanban" | "customer-service" | null;

const CreateProject = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(null);
  const [showSteps, setShowSteps] = useState(false);

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

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center"></div>

                  <div className="flex flex-col items-start">
                    <h3 className="font-semibold text-lg">Kanban</h3>

                    <p className="text-gray-500 text-sm">
                      Visualise and advance your project forward using issues on
                      a powerful board.
                    </p>
                  </div>
                </div>
                <Button variant="outline">Change template</Button>
              </div>
            </Card>
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
                  className="w-full bg-purple-900 hover:bg-purple-700"
                  onClick={() => console.log("Selected team-managed")}
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
                  onClick={() => console.log("Selected company-managed")}
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
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.back()}>
            <X className="h-4 w-4 mr-2" />
            Project templates
          </Button>
        </div>
        <div className="p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Made for you</h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-start ${selectedCategory === 'software' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => {
                setSelectedCategory('software');
                setSelectedTemplate(null); 
              }}
            >
              Software development
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${selectedCategory === 'service' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => {
                setSelectedCategory('service');
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
              {selectedCategory === 'software' ? 'Software development' : 'Service management'}
            </h1>
            <p className="text-gray-500 mb-8">
              {selectedCategory === 'software' 
                ? 'Plan, track and release great software. Get up and running quickly with templates that suit the way your team works. Plus, integrations for DevOps teams that want to connect work across their entire toolchain.'
                : 'Empower every team, from IT to HR to marketing, as they collect, prioritize, assign, and track incoming requests with ease. Get up and running quickly by selecting one of our tailored templates that include pre-configured workflows, forms, and settings based on service management best practices.'}
            </p>

            <div className="space-y-4">
              {selectedCategory === 'software' ? (
                <>
                  <Card 
                    className={`p-6 hover:shadow-md cursor-pointer border-2 transition-colors ${
                      selectedTemplate === 'kanban' ? 'border-emerald-950' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedTemplate('kanban')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded flex items-center justify-center">
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">Kanban</h3>
                          </div>
                          <p className="text-gray-500">Visualise and advance your project forward using issues on a powerful board.</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  <Card 
                    className={`p-6 hover:shadow-md cursor-pointer border-2 transition-colors ${
                      selectedTemplate === 'customer-service' ? 'border-emerald-950' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedTemplate('customer-service')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded flex items-center justify-center">
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">Customer service management</h3>
                          </div>
                          <p className="text-gray-500">Deliver great service experiences fast with a template designed to help your external customers.</p>
                        </div>
                      </div>
                    </div>
                  </Card>
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
