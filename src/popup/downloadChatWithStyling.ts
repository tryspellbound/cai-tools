import { startDownload } from "./startDownload"

export async function downloadChatWithStyling(
  characterName: string,
  creator: string
) {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  if (activeTab.id === undefined) return

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: async () => {
        const inlineStyles = (element: Element) => {
          const styles = window.getComputedStyle(element)
          let inlineStyle = ""
          for (let i = 0; i < styles.length; i++) {
            const prop = styles[i]
            const value = styles.getPropertyValue(prop)
            inlineStyle += `${prop}:${value};`
          }
          ;(element as HTMLElement).style.cssText += inlineStyle
          Array.from(element.children).forEach(inlineStyles)
        }

        const inlineImages = async (element: Element) => {
          const imageCache = new Map<string, string>();
          const images = element.querySelectorAll("img");
          for (let img of images) {
            try {
              const src = img.src;
              if (!imageCache.has(src)) {
                const response = await fetch(src);
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                imageCache.set(src, base64);
              }
              img.src = imageCache.get(src)!;
            } catch (error) {
              console.error("Failed to inline image:", error);
            }
          }
        }

        const chatContainer = document.querySelector(".inner-scroll-view")
        if (!chatContainer) {
          throw new Error("Chat container not found")
        }

        // Capture body background
        const bodyStyles = window.getComputedStyle(document.body)
        const bodyBackground = bodyStyles.getPropertyValue("background-color")

        inlineStyles(chatContainer)
        await inlineImages(chatContainer)

        return {
          html: chatContainer.outerHTML,
          bodyBackground
        }
      }
    })

    if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError.message)
    }

    const { html, bodyBackground } = result[0].result
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Character.ai Chat</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
          <style>
            body { 
              background-color: ${bodyBackground}; 
              margin: 0; 
              padding: 0; 
              font-family: 'Noto Sans', sans-serif;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
            }
            * {
              font-family: 'Noto Sans', sans-serif;
            }
            .chat-container {
              max-width: 824px;
              width: 100%;
              margin: 20px auto;
              padding: 20px;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="chat-container">
            ${html}
          </div>
        </body>
      </html>
    `

    startDownload(fullHtml, `${characterName}-${creator}-chat.html`, "text/html")
  } catch (error) {
    console.error("Error downloading chat with styling:", error)
  }
}

