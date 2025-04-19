import { redirect } from "next/navigation";
import { handleAuth } from "@/app/actions/handle-auth";
import { auth } from "@/app/lib/auth";

export default async function Login() {
  const session = await auth() 

  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-10">
      <h1 className="text-4xl font-bold">Login</h1>

      <form action={handleAuth}>
        <button
          type="submit"
          className="px-4 py-2 border rounded-md border-neutral-50 cursor-pointer"
        >
          SignIn with Google
        </button>
      </form>
    </div>
  );
}
