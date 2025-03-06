"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import Image from "next/image";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SignInDialog from "./SignInDialog";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const showCreateGroupButton = pathname !== "/create-group";

  const handleCreateGroupClick = () => {
    router.push("/create-group");
  };


  return (
    <div className="bg-background border-b">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
        Trackiy
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
         <div>test</div> 
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
