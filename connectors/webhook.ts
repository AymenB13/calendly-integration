import { z } from "zod";

const createWebhooksResponseSchema = z.object({
  resource: z.object({
    uri: z.string(),
  }),
});
const webhookURL = process.env.NEXT_PUBLIC_CALENDLY_WEBHOOK_URL as string;

export const createWebhooks = async (
  token: string,
  organization: string,
  owner: string
) => {
  const response = await fetch(
    `https://api.calendly.com/webhook_subscriptions`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: webhookURL,
        events: [
          "invitee.created",
          "invitee.canceled",
          "invitee_no_show.created",
          "invitee_no_show.deleted"
        ],
        organization,
        user: owner,
        scope: "user",
        signing_key: process.env.NEXT_PUBLIC_CALENDLY_WEBHOOK_SECRET
      })

    }
  );
  
  if (!response.ok) {
    throw new Error("Could not retrieve users");
  }
  const data: unknown = await response.json();

  const result = createWebhooksResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid createWebhooks response", {
      cause: result.error,
    });
  }

  return result.data.resource.uri;
};
