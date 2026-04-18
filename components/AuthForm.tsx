"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/auth";

const authFormSchema = (type: FormType) =>
  z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import(
        "firebase/auth"
      );
      const { getFirebaseAuth } = await import("@/lib/firebase/client");
      const auth = getFirebaseAuth();

      if (type === "sign-up") {
        const { name, email, password } = values;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password!);
        const idToken = await userCredential.user.getIdToken();

        const result = await signUp({ uid: userCredential.user.uid, name: name!, email, password: password! });
        if (!result.success) throw new Error(result.message);

        await signIn({ email, idToken });
        toast.success("Account created! Welcome to PrepWise.");
        router.push("/");
      } else {
        const { email, password } = values;
        const userCredential = await signInWithEmailAndPassword(auth, email, password!);
        const idToken = await userCredential.user.getIdToken();

        const result = await signIn({ email, idToken });
        if (!result.success) throw new Error(result.message);

        toast.success("Welcome back!");
        router.push("/");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[556px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>
        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField control={form.control} name="name" label="Name" placeholder="Your Name" />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your Email Address"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your Password"
              type="password"
            />
            <Button className="btn" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Please wait..."
                : isSignIn
                ? "Sign In"
                : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No Account Yet?" : "Have an account already?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-primary-100 ml-1"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
