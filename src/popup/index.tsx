import * as React from "react"

import "@/style.css"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Typography } from "@/components/ui/typography"
import { useEffect, useState } from "react"
import { useAsyncEffect } from "use-async-effect"

import { downloadChat } from "./downloadChat"
import { downloadChatWithStyling } from "./downloadChatWithStyling"

function openWebPage(url: string): Promise<chrome.tabs.Tab> {
  return chrome.tabs.create({ url })
}

export interface Message {
  content: string
  title: string
  visible: boolean
  isBot: boolean
}

async function getChatContent(): Promise<{
  elements: Message[] | undefined
  characterInfo: { creator: string; characterTitle: string } | undefined
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
      const getCharacterInfo = () => {
        const creatorElement =
          document.querySelector(
            'a[href^="/public-profile/?"][href*="username="]'
          ) ??
          document.querySelector(
            'a[href^="/profile/?"][href*="source="]'
          )
        if (!creatorElement) return null

        // Go up two levels to find the parent container
        const parentContainer = creatorElement.parentElement?.parentElement

        // Look for the character title within this container
        const characterTitleElement = parentContainer?.querySelector(
          'div[style*="font-size: 16px"][style*="font-weight: 600"]'
        )

        return {
          creator: creatorElement.textContent?.trim() || "",
          characterTitle: characterTitleElement?.textContent?.trim() || ""
        }
      }
      const getCanonicalLink = () => {
        const linkElement = document.querySelector(
          'link[rel="canonical"]'
        ) as HTMLLinkElement
        return linkElement?.href || ""
      }
      const characterInfo = getCharacterInfo()
      const canonicalLink = getCanonicalLink()

      const elements = Array.from(
        document.querySelectorAll("div.swiper-no-swiping")
      ).map((div) => {
        const titleRoot = div?.previousElementSibling?.firstElementChild
        const topLevelNode = div?.parentElement?.parentElement?.parentElement;
        return {
          content: div?.querySelector("[node]")?.textContent || "",
          title: titleRoot?.firstChild?.textContent || "",
          visible: topLevelNode?.classList.contains("swiper-slide") ? topLevelNode?.classList.contains("swiper-slide-active") : true,
          isBot: titleRoot?.querySelector('[aria-label="AI Character"]') != null
        }
      })

      return { elements, characterInfo, canonicalLink }
    }
  })

  const { elements, characterInfo, canonicalLink } = result.result

  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError)
    return undefined
  }
  return { elements, characterInfo, canonicalLink }
}

const CharacterAiContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[] | undefined>(undefined)
  const [characterInfo, setCharacterInfo] = useState<
    { creator: string; characterTitle: string } | undefined
  >(undefined)
  const [canonicalLink, setCanonicalLink] = useState<string | undefined>(
    undefined
  )
  useAsyncEffect(async () => {
    getChatContent().then(({ elements, characterInfo, canonicalLink }) => {
      setMessages(elements)
      setCharacterInfo(characterInfo)
      setCanonicalLink(canonicalLink)
    })
  }, [])

  const [downloadType, setDownloadType] = useState<"pretty" | "raw">("pretty")
  const download = () => {
    if (downloadType === "apretty") {
      downloadChatWithStyling(
        characterInfo?.characterTitle,
        characterInfo?.creator
      )
    } else {
      downloadChat(
        messages,
        characterInfo?.characterTitle,
        characterInfo?.creator
      )
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h4">
        Found a chat with {characterInfo?.characterTitle} by{" "}
        {characterInfo?.creator}!
      </Typography>

      <div className="flex flex-row gap-2 items-center">
        <Typography variant="small">Download as:</Typography>
        <Select
          value={downloadType}
          onValueChange={(value) => setDownloadType(value as "pretty" | "raw")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pretty">Pretty</SelectItem>
            <SelectItem value="raw">Raw Text</SelectItem>
          </SelectContent>
        </Select>
        <Typography variant="small">
          {downloadType === "pretty"
            ? "Uses formatting"
            : "No formatting, just raw text"}
        </Typography>
      </div>
      {messages ? (
        <Button onClick={() => download()}>
          Download Chat ({messages.length} Messages)
        </Button>
      ) : (
        <Button disabled>No Messages Found On This Page</Button>
      )}
    </div>
  )
}

const Popup: React.FC = () => {
  const [isCharacterAi, setIsCharacterAi] = useState(false)
  useAsyncEffect(async () => {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    if (activeTab.url?.includes("old.character.ai")) {
      setIsCharacterAi(true)
    }
  }, [])
  return (
    <Card id="popup" className="m-1 p-8 h-[20rem] w-[40rem]">
      <CardContent>
        <CardTitle className="flex items-center my-2">
          C.ai tools by Spellbound
          <span
            className={`inline-block w-2 h-2 rounded-full ml-2 ${isCharacterAi ? "bg-green-500" : "hidden"}`}></span>
        </CardTitle>

        {isCharacterAi && <CharacterAiContent />}
      </CardContent>
    </Card>
  )
}
export default Popup
