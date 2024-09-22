import type { Message } from "./Message";
import { startDownload } from "./startDownload";

export async function downloadChat(messages: Message[] | undefined, characterName: string, creator: string) {
  if (!messages) return;

  const content = messages
    .filter((msg) => msg.visible)
    .map((msg) => `${msg.title}${msg.isBot ? "" : "*"}: ${msg.content}`)
    .join("\n\n");


  startDownload(content, `${characterName}-${creator}-chat.txt`, "text/plain")
}
