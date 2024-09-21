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

const targetNode = document.body
const config = { childList: true, subtree: true }
observer.observe(targetNode, config)
console.log("Content script loaded C.ai")
