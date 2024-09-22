import type { ChatInfo } from "./ChatInfo"
import type { Message } from "./Message"

export async function getChatContent(): Promise<{
  elements: Message[] | undefined
  chatInfo: ChatInfo | undefined
  canonicalLink: string | undefined
}> {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  if (activeTab.id === undefined) return undefined
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id, allFrames: true },
    world: "MAIN",
    injectImmediately: true,
    func: () => {
      const roomTitle = document.querySelector("div.chattitle")?.textContent

      const getChatInfo = () => {
        if (roomTitle) {
          return {
            creator: "",
            characterTitle: roomTitle,
            isPrivate: true,
            isRoom: true
          }
        } else {
          const creatorElement =
            document.querySelector(
              'a[href^="/public-profile/?"][href*="username="]'
            ) ??
            document.querySelector('a[href^="/profile/?"][href*="source="]') ??
            document.querySelector('a[href^="/profile/?"][href*="char="]')
          if (!creatorElement) return null

          // Go up two levels to find the parent container
          const parentContainer = creatorElement.parentElement?.parentElement

          // Look for the character title within this container
          const characterTitleElement = parentContainer?.querySelector(
            'div[style*="font-size: 16px"][style*="font-weight: 600"]'
          )

          return {
            creator: creatorElement.textContent?.trim() || "",
            characterTitle: characterTitleElement?.textContent?.trim() || "",
            isPrivate:
              parentContainer.querySelector('path[fill="none"][d="M0 0h24v24H0z"]') !== null,
            isRoom: false
          }
        }
      }
      const getCanonicalLink = () => {
        const linkElement = document.querySelector(
          'link[rel="canonical"]'
        ) as HTMLLinkElement
        return linkElement?.href || ""
      }
      const characterInfo = getChatInfo()
      const canonicalLink = getCanonicalLink()
      let elements: Message[] | undefined = undefined
      if (roomTitle) {
        elements = Array.from(document.querySelectorAll("div.msg-row")).map(
          (div) => {
            const topLevelNode =
              div?.parentElement?.parentElement?.parentElement
            return {
              content: div?.querySelector("[node]")?.textContent || "",
              title:
                div?.querySelector(
                  'span[style*="font-weight: 650"][style*="font-size: 15px"][style*="display: flex"][style*="align-items: center"]'
                )?.textContent || "",
              visible: topLevelNode?.classList.contains("swiper-slide")
                ? topLevelNode?.classList.contains("swiper-slide-active")
                : true,
              isBot: div?.querySelector("div.msg-author-name") === null
            }
          }
        )
      } else {
        elements = Array.from(
          document.querySelectorAll("div.swiper-no-swiping")
        ).map((div) => {
          const titleRoot = div?.previousElementSibling?.firstElementChild
          const topLevelNode = div?.parentElement?.parentElement?.parentElement
          return {
            content: div?.querySelector("[node]")?.textContent || "",
            title: titleRoot?.firstChild?.textContent || "",
            visible: topLevelNode?.classList.contains("swiper-slide")
              ? topLevelNode?.classList.contains("swiper-slide-active")
              : true,
            isBot:
              titleRoot?.querySelector('[aria-label="AI Character"]') != null
          }
        })
      }

      return { elements, characterInfo, canonicalLink }
    }
  })

  const { elements, characterInfo, canonicalLink } = result.result

  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError)
    return undefined
  }
  return { elements, chatInfo: characterInfo, canonicalLink }
}
