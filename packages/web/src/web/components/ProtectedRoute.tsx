import { Redirect } from "wouter";
import { authClient } from "../lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#CC2222] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#555555] text-sm font-['Glacial_Indifference']">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Redirect to="/admin/login" />;

  return <>{children}</>;
}
