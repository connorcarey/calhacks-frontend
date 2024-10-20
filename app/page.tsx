"use client"

import { Tabs, Tab, Card, CardBody, CardHeader } from "@nextui-org/react";
import ChatInput from "./prompt/ChatPrompt";
import DragAndDropUploader from "./upload/DragAndDropUploader";

export default function Home() {

  return (
    <div className="p-10">
      <div className="flex w-full flex-col">
        <Tabs aria-label="Options">
          <Tab key="wardrobe" title="Wardrobe">
            <DragAndDropUploader />
          </Tab>
          <Tab key="prompt" title="Prompt">
            <ChatInput />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
