import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  async function handleSignOut() {
    "use server";
    await signOut();
    redirect("/sign-in");
  }

  return (
    <nav className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="PrepWise" width={38} height={32} />
        <h2 className="text-primary-100 max-sm:hidden">PrepWise</h2>
      </Link>

      <form action={handleSignOut}>
        <Button variant="ghost" className="text-light-100 hover:text-primary-100 cursor-pointer">
          Sign Out
        </Button>
      </form>
    </nav>
  );
};

export default Navbar;
