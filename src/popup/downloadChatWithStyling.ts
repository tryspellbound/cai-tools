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
          const images = element.querySelectorAll("img")
          for (let img of images) {
            try {
              let bitmap = await createImageBitmap(img)
              let canvas = document.createElement("canvas")
              let ctx = canvas.getContext("2d")
              canvas.width = bitmap.width
              canvas.height = bitmap.height
              ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
              img.src = canvas.toDataURL("image/png")
            } catch (error) {
              console.error("Failed to inline image:", error)
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

    const blob = new Blob([fullHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    chrome.downloads.download(
      {
        url: url,
        filename: `cai_${characterName}_${creator}_chat.html`,
        saveAs: true
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError)
        } else {
          console.log("Download started with ID:", downloadId)
        }
        URL.revokeObjectURL(url)
      }
    )
  } catch (error) {
    console.error("Error downloading chat with styling:", error)
  }
}
