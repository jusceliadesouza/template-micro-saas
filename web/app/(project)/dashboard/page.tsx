import Link from "next/link";
import { redirect } from "next/navigation";

import { handleAuth } from "@/app/actions/handle-auth";
import { auth } from "@/app/lib/auth";

export default async function Dashboard() {
  // Lado Servidor
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen flex-col gap-10 items-center justify-center">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>
      <p>
        {session?.user?.email
          ? session?.user?.email
          : "Usuário não está logado!"}
      </p>

      {session?.user?.email && (
        <form action={handleAuth}>
          <button
            type="submit"
            className="px-4 py-2 border rounded-md border-neutral-950 cursor-pointer"
          >
            Logout
          </button>
        </form>
      )}

      <Link href="/pagamentos" className="px-4 py-2 border rounded-md border-neutral-950 cursor-pointer">Pagamentos</Link>
    </div>
  );
}
