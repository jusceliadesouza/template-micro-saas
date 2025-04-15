import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-10">
      <h1 className="text-4xl font-bold">Landing Page</h1>
      
      <Link href="/login">
        <button type="button">Entrar</button>
      </Link>
    </div>
  );
}
