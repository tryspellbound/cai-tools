export async function hideBanner() {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (activeTab.id === undefined) return;
  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      const deleteBanner = () => {
        const appPage = document.querySelector("div.apppage");
        if (appPage) {
          const redElement = appPage.querySelector(
            "*[style*='background-color: rgb(206, 10, 9)']"
          );
          if (redElement) {
            redElement.remove();
          }
        }
      };
      deleteBanner();
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (Array.from(mutation.addedNodes).some(
            (node) => node.nodeName === "DIV" &&
              (node as HTMLDivElement).classList.contains("apppage")
          )) {
            deleteBanner();
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}
