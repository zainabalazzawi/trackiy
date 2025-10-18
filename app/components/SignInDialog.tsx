import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

type SignInDialogProps = {
  children?: ReactNode;
  redirectUrl?: string;
  signInDescription?: string;
  signUpDescription?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SignInDialog = ({
  children,
  redirectUrl,
  signInDescription,
  signUpDescription,
  open,
  onOpenChange,
}: SignInDialogProps) => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLoginSuccess = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create Account" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isSignUp ? signUpDescription : signInDescription}
          </DialogDescription>
        </DialogHeader>

        {!isSignUp ? (
          <>
            <LoginForm onSuccess={handleLoginSuccess} redirectUrl={redirectUrl} />
            <Button variant="outline" onClick={() => setIsSignUp(true)}>
              Create an account
            </Button>
          </>
        ) : (
          <>
            <SignupForm onSuccess={() => setIsSignUp(false)} redirectUrl={redirectUrl} />
            <Button variant="outline" onClick={() => setIsSignUp(false)}>
              Back to sign in
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
