import { z } from "zod";
import { extractUUID } from "@/utils/extract";

const createWebhooksResponseSchema = z.object({
  resource: z.object({
    uri: z.string(),
  }),
});

const listWebhooksResponseSchema = z.object({
  collection: z.array(
    z.object({
      uri: z.string(),
    })
  ),
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
          "invitee_no_show.deleted",
        ],
        organization,
        user: owner,
        scope: "user",
        signing_key: process.env.NEXT_PUBLIC_CALENDLY_WEBHOOK_SECRET,
      }),
    }
  );

  if (!response.ok) {
    console.log("webhook response error", response.ok);
  }
};

export const listWebhooks = async (token: string) => {
  const response = await fetch(
    `https://api.calendly.com/webhook_subscriptions`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.log("webhook response error", response.ok);
  }

  const data: unknown = await response.json();

  const result = listWebhooksResponseSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid list webhooks response");
  }

  return {
    uris: result.data.collection,
  };
};

export const deleteWebhooks = async (uri: string, accessToken: string) => {
  const uuid = await extractUUID(uri);
  const response = await fetch(
    `https://api.calendly.com/webhook_subscriptions/${uuid}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response;
};
