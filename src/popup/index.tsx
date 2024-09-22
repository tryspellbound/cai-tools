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
import { getChatContent } from "./getChatContent"
import { hideBanner } from "./hideBanner"
import type { Message } from "./Message"

export const CharacterAiContent: React.FC = () => {
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
  hideBanner()
  const [downloadType, setDownloadType] = useState<"pretty" | "raw">("pretty")
  const download = () => {
    if (downloadType === "pretty") {
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
  const openImportCharacter = () => {
    chrome.tabs.create({
      url: `https://beta.tryspellbound.com/app/home?caiLink=${encodeURIComponent(canonicalLink)}#cai`
    })
  }
  const [showConfirmation, setShowConfirmation] = useState(false)
  return messages && messages.length > 0 ? (
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
      {!showConfirmation ? (
        <Button onClick={() => setShowConfirmation(true)}>
          Export Character
        </Button>
      ) : (
        <div className="flex flex-col gap-2 w-full items-center">
          <Typography variant="h4">
            This will export your character to a non-C.ai site, continue?
            <br />
            <Typography variant="small">
              Note: This only works for public characters.
            </Typography>
          </Typography>
          <div className="flex flex-row gap-2">
            <Button
              color="primary"
              onClick={() => {
                openImportCharacter()
                setShowConfirmation(false)
              }}>
              Confirm
            </Button>
            <Button
              color="destructive"
              variant="destructive"
              onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      <Typography variant="h4">On Character.ai, but no chat found</Typography>
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

        {isCharacterAi ? (
          <CharacterAiContent />
        ) : (
          <Typography variant="small">Disabled: Not on Character.ai</Typography>
        )}
      </CardContent>
    </Card>
  )
}
export default Popup
