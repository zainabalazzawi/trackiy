"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import SignInDialog from "@/app/components/SignInDialog";

const InviteHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  useEffect(() => {
    const inviteToken = searchParams.get('invite');

    // 1. If no invite token exists, or if the session is still loading,
    //    we don't need to do anything.
    if (!inviteToken || status === 'loading') {
      return;
    }

    // 2. If the user is NOT logged in, we open the sign-in dialog.
    if (status === 'unauthenticated') {
      setShowSignInDialog(true);
      return;
    }

    // 3. If the user is logged in, we grant them access to the project.
    if (status === 'authenticated') {
      const acceptInvite = async () => {
        try {
          // We make one simple API call to accept the invitation.
          const response = await axios.post(`/api/invite/${inviteToken}`);
          const invitation = response.data;
          
          // Then, we redirect them to their new project.
          router.push(`/projects/${invitation.projectId}`);
        } catch (error) {
          console.error("Failed to process invitation:", error);
          // If anything goes wrong, we just take them to the main projects page.
          router.push('/projects');
        }
      };
      
      acceptInvite();
    }
  }, [status, searchParams, router]);

  return (
    <SignInDialog
      open={showSignInDialog}
      onOpenChange={setShowSignInDialog}
      signInDescription="Please sign in to accept your project invitation."
      redirectUrl={`/projects?invite=${searchParams.get('invite')}`}
    />
  );
};

export default InviteHandler; 