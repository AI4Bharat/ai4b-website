import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    let externalApiUrl;

    if (body.task === "translation") {
      externalApiUrl =
        "https://api.dhruva.ekstep.ai/services/inference/translation";
    }

    const config = {
      controlConfig: {
        dataTracking: true,
      },
      config: {
        serviceId: body.serviceId,
        language: {
          sourceLanguage: body.sourceLanguage,
          sourceScriptCode: "",
          targetLanguage: body.targetLanguage,
          targetScriptCode: "",
        },
      },
      input: [
        {
          source: body.input,
        },
      ],
    };
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-source": "API_KEY",
        Authorization: process.env.DHRUVA_API_KEY,
      },
      body: JSON.stringify(config),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
