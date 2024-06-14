import { getToken } from "@/connectors/auth";
import { createWebhooks } from "@/connectors/webhook";

type SetupOrganisationParams = {
  code: string;
};

export const setupOrganisation = async ({ code }: SetupOrganisationParams) => {
  // retrieve token from SaaS API using the given code
  const { accessToken, organization, owner } = await getToken(code);

  await createWebhooks(accessToken, organization, owner);
};
