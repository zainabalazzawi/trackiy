"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SignInDialog from "./components/SignInDialog";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-4xl mt-16">
        <CardContent className="p-12 text-center space-y-8">
          <Image
            src="/Trackiy.svg"
            alt="Trackiy Logo"
            width={200}
            height={200}
            className="mx-auto"
            priority
          />

          <h1 className="text-3xl md:text-5xl text-muted-foreground font-semibold">Welcome to Trackiy</h1>
          <p className="text-lg md:text-2xl text-muted-foreground">
            Project and Ticket Management Made Simple
          </p>

          <div className="flex flex-col sm:flex-row gap-4 text-left max-w-2xl mx-auto">
            <div className="flex gap-3 flex-1">
              <CheckCircle2 className="h-6 w-6 text-[#649C9E]" />
              <div>
                <h3 className="font-semibold">Organize Projects</h3>
                <p className="text-sm text-muted-foreground">
                  Manage all your projects in one place
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-1">
              <CheckCircle2 className="h-6 w-6 text-[#649C9E]" />
              <div>
                <h3 className="font-semibold">Track Tickets</h3>
                <p className="text-sm text-muted-foreground">
                  Stay on top of tasks and issues
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-1">
              <CheckCircle2 className="h-6 w-6 text-[#649C9E]" />
              <div>
                <h3 className="font-semibold">Collaborate</h3>
                <p className="text-sm text-muted-foreground">
                  Work together with your team
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto pt-4">
            {session ? (
              <>
                <p className="text-lg text-muted-foreground">
                  Welcome back, <span className="font-semibold">{session.user?.name}</span>!
                </p>
                <Button
                  size="lg"
                  className="w-full bg-[#649C9E] hover:bg-[#527f81]"
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
                    className="w-full bg-[#649C9E] hover:bg-[#527f81]"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignInDialog>
                <p className="text-sm text-muted-foreground">
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
