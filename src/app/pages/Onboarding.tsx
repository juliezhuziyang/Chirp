import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export default function Onboarding() {
  return (
    <ProtectedRoute redirectIfOnboarded>
      <OnboardingFlow />
    </ProtectedRoute>
  );
}
