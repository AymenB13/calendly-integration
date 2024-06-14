import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const state = crypto.randomUUID();

  const redirectUrl = new URL(`https://auth.calendly.com/oauth/authorize/`);
  redirectUrl.searchParams.append("response_type", "code");
  redirectUrl.searchParams.append(
    "client_id",
    process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID as string
  );
  redirectUrl.searchParams.append(
    "redirect_uri",
    process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI as string
  );

  // we redirect the user to the installation page of the Calendly application
  redirect(redirectUrl.toString());
}
