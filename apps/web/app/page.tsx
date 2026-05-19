"use client";
import { trpc } from "~/trpc/client";

export default function Home() {
  const { data } = trpc.chaicode.useQuery({ email: "h@c.vom" }); // normal server without hook
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h2>Server Messssage: {data?.message}</h2>
      </div>
    </main>
  );
}
