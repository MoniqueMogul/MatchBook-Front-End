// // src/lib/auth/getAccessToken.ts

// import { supabase } from "@/lib/supabase";

// export async function getAccessToken(): Promise<string> {
//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   if (error) {
//     throw new Error("Unable to get authentication session.");
//   }

//   if (!session?.access_token) {
//     throw new Error("You are not authenticated.");
//   }

//   return session.access_token;
// }