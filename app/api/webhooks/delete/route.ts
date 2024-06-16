import { NextRequest, NextResponse } from "next/server";
import { getRefreshToken } from "@/app/connectors/auth";
import { listWebhooks, deleteWebhooks } from "@/app/connectors/webhook";

type DeleteWebhookParams = {
  userId: string;
  refreshToken: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as DeleteWebhookParams; // Use JSON method directly
    const { userId, refreshToken } = body;

    if (!userId || !refreshToken) {
      return new NextResponse("Invalid userId or refreshToken", { status: 400 });
    }

    const { accessToken } = await getRefreshToken(refreshToken);
    const { uris } = await listWebhooks(accessToken);

    const results = await Promise.all(
      uris.map(async ({ uri }) => {
        try {
          const response = await deleteWebhooks(uri, accessToken);
          return { uri, status: response.status, success: true };
        } catch (error: any) {
          const status = error.response ? error.response.status : 500;
          return { uri, status, success: false };
        }
      })
    );

    const failedStatuses = results.filter(result => !result.success && [401, 403, 404].includes(result.status));

    if (failedStatuses.length > 0) {
      return new NextResponse("Failed to delete some webhooks", { status: 500 });
    }

    return new NextResponse("All webhooks deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
