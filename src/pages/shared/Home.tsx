import { useUser } from "../../contexts/UserContext";
import ClientHome from "../client/ClientHome";
import FreelancerHome from "../freelancer/FreelancerHome";

export default function Home() {
  const { isClient, isFreelancer, loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="mt-2 text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to MatchLance</h1>
        <p className="mt-2 text-gray-600">
          Connect with top freelancers or find your next opportunity.
        </p>
      </div>
    </div>
  );
}
