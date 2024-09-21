import type { Message } from ".";

export async function downloadChat(messages: Message[] | undefined, characterName: string, creator: string) {
  if (!messages) return;

  const content = messages
    .filter((msg) => msg.visible)
    .map((msg) => `${msg.title}${msg.isBot ? "" : "*"}: ${msg.content}`)
    .join("\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download(
    {
      url: url,
      filename: `cai_${characterName}_${creator}_chat.txt`,
      saveAs: true
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Download started with ID:", downloadId);
      }
      URL.revokeObjectURL(url);
    }
  );
}
