"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

const CreateProject = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<
    "software" | "service"
  >();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="p-6 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to projects
        </Button>

        <div>
          <h1 className="text-2xl font-semibold mb-2"> Project template</h1>
          <p className="text-gray-500 mb-8">
            Get started by selecting a project template below
          </p>

          <div className="grid grid-cols-2 gap-6">
            <Card
              className={`flex justify-center cursor-pointer border-2 transition-colors ${
                selectedTemplate === "software"
                  ? "border-emerald-950"
                  : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => setSelectedTemplate("software")}
            >
              <h3 className="font-semibold text-lg text-center">
                Software development
              </h3>
            </Card>
            <Card
              className={`flex justify-center cursor-pointer border-2 transition-colors ${
                selectedTemplate === "service"
                  ? "border-emerald-950"
                  : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => setSelectedTemplate("service")}
            >
              <h3 className="font-semibold text-lg text-center">
                Service management
              </h3>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              disabled={!selectedTemplate}
              onClick={() => {
                console.log("Selected template:", selectedTemplate);
              }}
            >
              Use template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
