import { SetStateAction, Dispatch } from "react";

export const API_KEY_STORAGE = "OPENAI_API_KEY";

export type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

// Process the OpenAI stream response
export const processStreamData = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  botMessageId: string,
  setMessages: Dispatch<SetStateAction<Message[]>>
) => {
  let contentSoFar = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode the chunk
    const chunk = new TextDecoder().decode(value);

    // Process each line in the chunk
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      // Only process data lines
      if (line.startsWith("data:")) {
        // Skip [DONE] message
        if (line === "data: [DONE]") continue;

        try {
          // Extract JSON content
          const jsonContent = line.replace(/^data: /, "");
          const parsedData = JSON.parse(jsonContent);

          // Get content delta
          const contentDelta = parsedData.choices?.[0]?.delta?.content || "";
          contentSoFar += contentDelta;

          // Update message with accumulated content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: contentSoFar } : msg
            )
          );
        } catch (e) {
          console.error("Error parsing stream data:", e);
        }
      }
    }
  }
};

// Create and send a message to OpenAI API
export const sendChatMessage = async (
  message: string,
  apiKey: string,
  setMessages: Dispatch<SetStateAction<Message[]>>,
  expoFetch: any
) => {
  if (!apiKey) return;

  // Add user message to the chat
  setMessages((prev) => [
    ...prev,
    { id: Date.now().toString(), role: "user", text: message },
  ]);

  try {
    const response = await expoFetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: message }],
          stream: true,
        }),
      }
    );

    const reader = response.body?.getReader();
    if (!reader) {
      console.error("Failed to get reader from response");
      return;
    }

    const botMessageId = Date.now().toString();
    // Add initial empty bot message
    setMessages((prev) => [
      ...prev,
      { id: botMessageId, role: "bot", text: "" },
    ]);

    // Process the stream
    await processStreamData(reader, botMessageId, setMessages);
  } catch (error) {
    console.error("Streaming error:", error);
  }
};
