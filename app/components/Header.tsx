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
    <div className="bg-gradient-to-r from-white via-slate-50/30 to-white border-b border-slate-200/80 shadow-md sticky top-0 z-50 backdrop-blur-lg">
      <div className="mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-6 w-full">
          <Link href="/" className="font-semibold text-xl hover:opacity-80 transition-opacity">
            <Image
              src="/Trackiy.svg"
              alt="Logo"
              width={100}
              height={100}
              className="cursor-pointer w-20 sm:w-[100px] drop-shadow-sm"
              onClick={() => router.push("/")}
            />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm sm:text-base font-semibold hover:bg-slate-100 hover:text-[#649C9E] transition-colors duration-200 rounded-lg"
              >
                Projects
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 shadow-xl border-slate-200/80 bg-white">
              <DropdownMenuItem 
                onClick={() => router.push("/projects")}
                className="hover:bg-slate-100 cursor-pointer transition-colors duration-200"
              >
                <Layout className="mr-2 h-4 w-4 text-[#649C9E]" />
                View all projects
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push("/projects/create")}
                className="hover:bg-slate-100 cursor-pointer transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4 text-[#649C9E]" />
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

        <div className="flex items-center justify-end gap-2 sm:gap-4">
          {session && (
            <div className="hidden sm:block mr-1 sm:mr-3 text-xs sm:text-base text-slate-700 whitespace-nowrap font-medium">
              Welcome <span className="text-gradient-primary font-semibold">{session.user?.name}</span>
            </div>
          )}
          {!session ? (
            <SignInDialog>
              <Button
                variant="outline"
                className="mr-2 sm:mr-4 text-sm sm:text-base border-[#649C9E] text-[#649C9E] hover:bg-gradient-to-r hover:from-[#649C9E] hover:to-[#527f81] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Sign in
              </Button>
            </SignInDialog>
          ) : (
            <div>
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="flex flex-row items-center cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#649C9E]/30 shadow-md hover:shadow-lg transition-all duration-200">
                      {session?.user?.image && (
                        <AvatarImage
                          src={session?.user?.image?.replace("s96-c", "s400-c")}
                          className="object-cover"
                        />
                      )}

                      <AvatarFallback className="text-xs sm:text-sm bg-gradient-to-br from-[#649C9E] to-[#527f81] text-white">
                        {session?.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isOpen ? (
                      <ChevronUp size={20} className="ml-1 text-slate-500" />
                    ) : (
                      <ChevronDown size={20} className="ml-1 text-slate-500" />
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="shadow-xl border-slate-200/80 w-48 bg-gradient-to-br from-white to-slate-50/30">
                  <DropdownMenuItem 
                    onClick={() => router.push("/settings")}
                    className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 cursor-pointer transition-all duration-200"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="hover:bg-red-50 text-red-600 cursor-pointer transition-colors"
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
