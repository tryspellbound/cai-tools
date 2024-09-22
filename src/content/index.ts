import type { PlasmoCSConfig } from "plasmo"

console.log("Content script loaded C.ai")

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    const appPage = document.querySelector("div.apppage")
    if (appPage) {
      const redElement = appPage.querySelector(
        "*[style*='background-color: rgb(206, 10, 9)']"
      )
      if (redElement) {
        redElement.remove()
      }
    }
  })
})

observer.observe(document.body, { childList: true, subtree: true })

export {}

export const config: PlasmoCSConfig = {
  matches: ["https://old.character.ai/*"],
  world: "MAIN"
}
