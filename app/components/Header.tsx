"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, Layout } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SignInDialog from "./SignInDialog";
import TicketSearch from "./TicketSearch";
import BreadcrumbNav from "./BreadcrumbNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render header on landing page
  if (pathname === "/") {
    return null;
  }

  return (
    <div className="bg-background border-b">
      <div className="mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-6 w-full">
          <Link href="/" className="font-semibold text-xl flex-shrink-0">
            <Image
              src="/Trackiy.svg"
              alt="Logo"
              width={100}
              height={100}
              className="cursor-pointer w-20 sm:w-[100px]"
              onClick={() => router.push("/")}
            />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                Projects
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => router.push("/projects")}>
                <Layout className="mr-2 h-4 w-4" />
                View all projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/projects/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {session && (
            <div className="hidden sm:block">
              <TicketSearch />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {session && (
            <div className="hidden sm:block mr-1 sm:mr-3 text-xs sm:text-lg whitespace-nowrap">
              Welcome {session.user?.name}
            </div>
          )}
          {!session ? (
            <SignInDialog>
              <Button
                variant="outline"
                className="mr-2 sm:mr-4 text-sm sm:text-base"
              >
                Sign in
              </Button>
            </SignInDialog>
          ) : (
            <div>
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="flex flex-row items-center">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                      {session?.user?.image && (
                        <AvatarImage
                          src={session?.user?.image?.replace("s96-c", "s400-c")}
                          className="object-cover cursor-pointer"
                        />
                      )}

                      <AvatarFallback className="text-xs sm:text-sm">
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
                    )}
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
          <SidebarTrigger />
        </div>
      </div>
      <div className="m-2.5 sm:hidden">{session && <TicketSearch />}</div>
      <BreadcrumbNav />
    </div>
  );
};

export default Header;
