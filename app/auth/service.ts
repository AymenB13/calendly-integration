import { getToken } from "@/app/connectors/auth";
import { createWebhooks } from "@/app/connectors/webhook";
import { extractUUID } from "@/utils/extract";

type SetupOrganisationParams = {
  code: string;
};

export const setupOrganisation = async ({ code }: SetupOrganisationParams) => {
  // retrieve token from SaaS API using the given code
  const { accessToken, refreshToken, organization, owner } = await getToken(
    code
  );
  if (!process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL) {
    console.error("Invalid Webhook URL");
    return;
  }
  const response = await fetch(
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: owner,
        event: "grant.created",
        refresh_token: refreshToken,
      }),
    }
  );

  if (!response.ok) {
    console.error("Failed to send data to Google Sheets:", response.statusText);
  }

  await createWebhooks(accessToken, organization, owner);
};
