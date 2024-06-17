import { z } from "zod";

const calendlyUserSchema = z.object({
  resource: z.object({
    name: z.string(),
    email: z.string(),
    slug: z.string(),
    timezone: z.string(),
    current_organization: z.string(),
    avatar_url: z.string().nullable(),
  }),
});

export type GetUsersParams = {
  accessToken: string;
};

export const getUser = async ({ accessToken }: GetUsersParams) => {
  const url = new URL(`https://api.calendly.com/users/me`);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not retrieve users");
  }

  const resData: unknown = await response.json();
  const result = calendlyUserSchema.safeParse(resData);

  if (!result.success) {
    throw new Error("Invalid Calendly token response");
  }
  return {
    user: result.data.resource,
  };
};
