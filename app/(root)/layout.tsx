import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const authed = await isAuthenticated();
  if (!authed) redirect("/sign-in");

  return (
    <div className="root-layout">
      <Navbar />
      {children}
    </div>
  );
};

export default RootLayout;
