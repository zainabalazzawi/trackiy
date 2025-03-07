"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SignInDialog from "./SignInDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background border-b">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">Trackiy</div>

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
                  {/* <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Settings
                  </DropdownMenuItem> */}
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
