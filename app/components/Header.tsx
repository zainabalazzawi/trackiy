"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Clock, Layout } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SignInDialog from "./SignInDialog";
import TicketSearch from "./TicketSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background border-b">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-xl">
          <Image
            src="/Trackiy.svg"
            alt="Logo"
            width={100}
            height={100}
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                Projects
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => router.push('/projects/recent')}>
                <Clock className="mr-2 h-4 w-4" />
                Recent projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/projects')}>
                <Layout className="mr-2 h-4 w-4" />
                View all projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/projects/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {session && <TicketSearch />}
        </div>

        <div className="flex items-center">
          {session && <div className="mr-3">Welcome {session.user?.name}</div>}
          {!session ? (
            <SignInDialog>
              <Button variant="outline" className="mr-4">
                Sign in
              </Button>
            </SignInDialog>
          ) : (
            <div>
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="flex flex-row items-center">
                    <Avatar>
                      {session?.user?.image && (
                        <AvatarImage
                          src={session?.user?.image?.replace("s96-c", "s400-c")}
                          className="object-cover cursor-pointer"
                        />
                      )}

                      <AvatarFallback>
                        {session?.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isOpen ? (
                      <ChevronUp size={25} className="ml-1 text-slate-400" />
                    ) : (
                      <ChevronDown size={25} className="ml-1 text-slate-400" />
                    )}{" "}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
