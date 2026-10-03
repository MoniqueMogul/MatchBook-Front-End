import axios from "axios";
import { getSellerProfile } from "@/lib/api/seller";
import { getBuyerProfile } from "@/lib/api/buyer";
import { useAuthStore } from "@/store/authStore";

export async function getPostSignInPath(): Promise<string> {
  useAuthStore.getState().setStep(2);
  try {
    const profile = await getBuyerProfile();
    if (!profile?.id) throw new Error("Could not load your buyer profile. Please try again.");
    useAuthStore.getState().setRole("buyer");
    return "/buyer-dashboard";
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      try {
        await getSellerProfile();
        useAuthStore.getState().setRole("seller");
        return "/seller";
      } catch (sellerError) {
        if (axios.isAxiosError(sellerError) && sellerError.response?.status === 404) {
          return "/role-selection";
        }
        throw new Error("You are signed in, but we could not load your account. Please try again.");
      }
    }
    throw new Error("You are signed in, but we could not load your profile. Please try again.");
  }
}
