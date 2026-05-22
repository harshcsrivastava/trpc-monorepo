"use client";
import { useEffect } from "react";
import { useUser } from "~/hooks/api/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user && user.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, router]);
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        HI
        {JSON.stringify(user, null, 2)}
      </div>
    </main>
  );
}
