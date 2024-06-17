import { z } from "zod";

const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  organization: z.string(),
  owner: z.string(),
});

const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID as string;
const clientSecret = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET as string;

export const getToken = async (code: string) => {
  const encodedKey = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(`https://auth.calendly.com/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodedKey}`,
    },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID as string,
      client_secret: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET as string,
      grant_type: "authorization_code",
      redirect_uri: process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI as string,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not retrieve token");
  }

  const data: unknown = await response.json();
  const result = tokenResponseSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid Jira token response");
  }

  return {
    accessToken: result.data.access_token,
    refreshToken: result.data.refresh_token,
    organization: result.data.organization,
    owner: result.data.owner,
  };
};

export const getRefreshToken = async (refreshToken: string) => {
  const encodedKey = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );
  const response = await fetch(`https://auth.calendly.com/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `${encodedKey}`,
    },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID as string,
      client_secret: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_SECRET as string,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Could not retrieve token', { cause: response.statusText });
  }

  const data: unknown = await response.json();

  const result = tokenResponseSchema.safeParse(data);

  if (!result.success) {
    throw new Error('Invalid Calendly token response');
  }

  return {
    accessToken: result.data.access_token,
  };
};
