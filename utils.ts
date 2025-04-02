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
  let accumulatedContent = "";
  const decoder = new TextDecoder();

  // Continuously read chunks from the stream until it's done
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode the binary chunk into text
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    // Process each line in the chunk
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // OpenAI stream format starts lines with "data:"
      // Skip lines that don't start with "data:" or are a "[DONE]" signal
      if (!line.startsWith("data:")) continue;
      if (line === "data: [DONE]") continue;

      try {
        const jsonContent = line.replace(/^data: /, "");
        const parsedData = JSON.parse(jsonContent);
        const newContent = parsedData.choices?.[0]?.delta?.content || "";
        accumulatedContent += newContent;

        // Update the bot's message in the chat with the latest accumulated content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: accumulatedContent } : msg
          )
        );
      } catch (error) {
        console.error("Error parsing stream data:", error);
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

  // Send the message to OpenAI API
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
