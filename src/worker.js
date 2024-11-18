export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);

    try {
      const { url, prompt } = await request.json();

      if (!url && !prompt) {
        return new Response("Invalid request", { status: 400 });
      }

      switch (url.pathname) {
        case "/ocr":
          // Process OCR requests
          const aimlApiOcrResponse = await fetch("https://api.aimlapi.com/ocr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.AIML_API_KEY}`,
            },
            body: JSON.stringify({
              document: url,
            }),
          })

          const ocrResponse = await aimlApiOcrResponse.json();

          return new Response(JSON.stringify(ocrResponse), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        case "/ofr":
          // Process OFR requests
          const aimlApiOfrResponse = await fetch("https://api.aimlapi.com/vision", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.AIML_API_KEY}`,
            },
            body: JSON.stringify({
              image: {
                source: {
                  imageUri: url,
                },
              },
              features: [
                {
                  type: "FACE_DETECTION",
                }
              ]
            }),
          });

          const ofrResponse = await aimlApiOfrResponse.json();

          return new Response(JSON.stringify(ofrResponse), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        default:
          // Regular chat completion logic
          const aimlApiChatResponse = await fetch(
            "https://api.aimlapi.com/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.AIML_API_KEY}`,
              },
              body: JSON.stringify({
                model: env.AIML_MODEL,
                messages: [
                  {
                    prompt
                  },
                ],
                stream: false,
              }),
            }
          );

          const chatResponse = await aimlApiChatResponse.json();

          return new Response(
            JSON.stringify(chatResponse),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  },
};
