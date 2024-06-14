import { NextRequest, NextResponse } from "next/server";
import { extractTopLevelProperties } from "@/utils/extract";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text(); // Get the raw request body

  // Process the webhook event
  const event = JSON.parse(body);

  console.log("event:", event)
  if (!process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL) {
    return new NextResponse("Invalid googesheet webhook url", {
      status: 404,
    });
  }
  const send = await extractTopLevelProperties(event);
  // Send the webhook data to Google Sheets
  const response = await fetch(
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(send),
    }
  );

  if (!response.ok) {
    console.error("Failed to send data to Google Sheets:", response.statusText);
    return new NextResponse("Failed to send data to Google Sheets", {
      status: 500,
    });
  }

  // Respond with 200 status to acknowledge receipt
  return new NextResponse("Webhook received and forwarded to Google Sheets", {
    status: 200,
  });
}
