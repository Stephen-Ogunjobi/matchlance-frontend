import { useUser } from "../../contexts/UserContext";
import ClientHome from "../client/ClientHome";
import FreelancerHome from "../freelancer/FreelancerHome";

export default function Home() {
  const { isClient, isFreelancer, loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[var(--color-muted)] rounded-lg w-64"></div>
            <div className="h-5 bg-[var(--color-muted)] rounded w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isClient) {
    return <ClientHome />;
  }

  if (isFreelancer) {
    return <FreelancerHome />;
  }

  // Fallback for unauthenticated or unknown role
  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-16">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 mb-8">
          <span className="text-white font-bold text-3xl">M</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight">
          Welcome to MatchLance
        </h1>
        <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Connect with top freelancers or find your next opportunity.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/signup"
            className="px-6 py-3 rounded-xl font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-xl font-semibold bg-[var(--color-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
  );
}
