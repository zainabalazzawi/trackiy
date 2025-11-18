"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SignInDialog from "./components/SignInDialog";
import { ArrowRight, CheckCircle2, Layers, Users } from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-100 via-white via-50% to-[#649C9E]/5">
      <Card className="max-w-5xl shadow-sm border border-slate-200/50 backdrop-blur-sm">
        <CardContent className="p-8 sm:p-12 lg:p-16 text-center space-y-5">
          <Image
            src="/Trackiy.svg"
            alt="Trackiy Logo"
            width={240}
            height={240}
            className="mx-auto"
            priority
          />

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-hero">
              Welcome to Trackiy
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gradient-subtitle font-light">
              Project and Ticket Management Made Simple
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
            <div className="flex flex-col items-center gap-1 p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 transition-all duration-300 border border-slate-200/60 hover:border-[#649C9E]/50 hover:-translate-y-1">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#649C9E] to-[#527f81]">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Organize Projects</h3>
              <p className="text-sm text-slate-600">
                Manage all your projects in one place
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 transition-all duration-300 border border-slate-200/60 hover:border-[#649C9E]/50 hover:-translate-y-1">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#649C9E] to-[#527f81]">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Track Tickets</h3>
              <p className="text-sm text-slate-600">
                Stay on top of tasks and issues
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 transition-all duration-300 border border-slate-200/60 hover:border-[#649C9E]/50 hover:-translate-y-1">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#649C9E] to-[#527f81]">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Collaborate</h3>
              <p className="text-sm text-slate-600">
                Work together with your team
              </p>
            </div>
          </div>

          <div className="space-y-6 max-w-md mx-auto pt-6">
            {session ? (
              <>
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#649C9E]/15 to-[#527f81]/10 border border-[#649C9E]/30">
                  <p className="text-lg text-slate-700">
                    Welcome back, <span className="font-bold text-gradient-primary">{session.user?.name}</span>! 👋
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#649C9E] to-[#527f81] hover:from-[#527f81] hover:to-[#3d6061] text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 text-base font-semibold py-6"
                  onClick={() => router.push("/projects")}
                >
                  Go to Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <SignInDialog>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#649C9E] to-[#527f81] hover:from-[#527f81] hover:to-[#3d6061] text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 text-base font-semibold py-6"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignInDialog>
                <p className="text-sm text-slate-600">
                  Sign in to start managing your projects
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
