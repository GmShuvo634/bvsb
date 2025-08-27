import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon, IconType } from "@/components/icons";
import { Config } from "@/config";

export interface ChatDataProps {
  avatar: string;
  message: string;
}

interface ChatPanelProps {
  messages: ChatDataProps[];
  sendMessage: (message: string) => void;
  onCloseChatRoom: () => void;
  isConnected: boolean;
}

export default function ChatPanel(props: ChatPanelProps) {
  const { messages, sendMessage, onCloseChatRoom, isConnected } = props;

  const [inputText, setInputText] = useState("");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      (chatBoxRef.current as any).scrollTop = (
        chatBoxRef.current as any
      ).scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen px-3 py-4 w-80 z-10">
      <div className="w-full h-full rounded-2xl border-2 border-solid border-[#ffef92] flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between border-b-2 border-solid border-[#ffef92] px-3 py-2">
          <span className="text-[#ffef92] font-oswald text-2xl">
            Live Chat Room
          </span>
          <button onClick={onCloseChatRoom}>
            <Icon
              type={IconType.CLOSE}
              className="!w-6 !h-6 !fill-[#ffef92] hover:!fill-[#9e8130]"
            />
          </button>
        </div>
        <div className="flex flex-col justify-between w-full h-full gap-2 p-2 pb-4 overflow-hidden">
          <div
            ref={chatBoxRef}
            className="flex flex-col w-full h-full gap-2 overflow-x-hidden overflow-y-auto"
          >
            {messages.length > 0 &&
              messages.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row items-start justify-start w-full gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-solid border-[#ffef92] overflow-hidden`}
                  >
                    <Image
                      alt="Avatar"
                      src={
                        item.avatar
                          ? `${Config.serverUrl.avatars}${item.avatar}`
                          : "/images/avatar-default.png"
                      }
                      width={40}
                      height={40}
                    />
                  </div>
                  <span className="max-w-[220px] px-2 py-1 rounded-lg break-words bg-[#ffef92] text-sm min-h-[28px] mt-[6px]">
                    {item.message}
                  </span>
                </div>
              ))}
          </div>
          {isConnected && (
            <div className="relative flex flex-row items-center w-full h-12">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(inputText);
                    setInputText("");
                  }
                }}
                className="px-2 absolute w-full h-full rounded-xl border-2 border-solid border-[#ffef92] bg-transparent outline-none text-[#ffef92] placeholder-[#808080]"
                placeholder="Write Message..."
              />
              <div className="absolute flex flex-row items-center gap-2 right-2">
                <button
                  onClick={() => {
                    sendMessage(inputText);
                    setInputText("");
                  }}
                >
                  <Icon
                    type={IconType.SEND}
                    className="!w-7 !h-7 !fill-[#ffef92] hover:!fill-[#9e8130]"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
