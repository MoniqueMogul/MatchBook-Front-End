import { useAuthStore } from "@/store/authStore";
import { resolveSignInPath } from "./roleRouting";

export async function getPostSignInPath(): Promise<string> {
  useAuthStore.getState().setStep(2);
  return resolveSignInPath();
}
