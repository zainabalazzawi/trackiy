import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { SignupSchema, type SignupInput } from "@/app/api/_lib/schemas";

const SignupForm = ({ onSuccess, redirectUrl }: { onSuccess?: () => void; redirectUrl?: string }) => {
  const form = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const signUpMutation = async (signupData: SignupInput) => {
    const response = await axios.post("/api/auth/signup", signupData);
    if (response.status !== 200) {
      throw new Error(response.data.error);
    }
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: signUpMutation,
    onSuccess: () => {
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    },
  });
  const onHandleSubmit = (signupData: SignupInput) => {
    mutation.mutate(signupData);
  };

  const handleGoogleSignUp = () => {
    signIn("google", {
      callbackUrl: redirectUrl || "/"
    })
  };
console.log(mutation.error)
  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        className="w-full"
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Sign up with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onHandleSubmit)}>
          <FormItem className="my-5">
            <FormLabel>Name</FormLabel>
            <Input type="text" {...register("name")} />
            <FormMessage>
              {errors.name && <span>{errors.name.message}</span>}
            </FormMessage>
          </FormItem>
          <FormItem className="my-5">
            <FormLabel>Email</FormLabel>
            <Input {...register("email")} />
            <FormMessage>
              {errors.email && <span>{errors.email.message}</span>}
            </FormMessage>
          </FormItem>

          <FormItem className="my-5">
            <FormLabel>Password</FormLabel>
            <Input type="password" {...register("password")} />
            <FormMessage>
              {errors.password && <span>{errors.password.message}</span>}
            </FormMessage>
          </FormItem>
          {/* <FormItem>
            <FormLabel>Profile Image</FormLabel>
            <ImageUpload name="image" />
            <FormMessage>
              {errors.image && <span>{errors.image.message}</span>}
            </FormMessage>
          </FormItem> */}
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing up..." : "Sign up"}
          </Button>
{/* 
          {mutation.isError && (
            <div className="mt-4 p-4 text-red-800 border border-red-800 rounded text-center">
            </div>
          )} */}
          {mutation.isSuccess && (
            <div className="mt-4 p-4 text-green-800 border border-green-800 rounded text-center">
              Account created successfully!
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};
export default SignupForm;
