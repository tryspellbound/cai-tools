export function startDownload(content: string, fileName: string, mimeType: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]?.id) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (content, fileName, mimeType) => {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
          args: [content, fileName, mimeType]
        });
        console.log("Download script executed successfully");
      } catch (error) {
        console.error("Error executing download script:", error);
      }
    }
  });
}
