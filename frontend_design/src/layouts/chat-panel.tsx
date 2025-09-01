import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon, IconType } from "@/components/icons";
import { Config } from "@/config";
import { useChat } from "@/hooks/useChat";

export interface ChatDataProps {
  avatar: string;
  message: string;
  username?: string;
  timestamp?: string;
  isDemo?: boolean;
  country?: string;
}

interface ChatPanelProps {
  messages?: ChatDataProps[]; // Made optional since we'll use the hook
  sendMessage?: (message: string) => void; // Made optional
  onCloseChatRoom: () => void;
  isConnected?: boolean; // Made optional
}

export default function ChatPanel(props: ChatPanelProps) {
  const { messages: propMessages, sendMessage: propSendMessage, onCloseChatRoom, isConnected: propIsConnected } = props;

  // Use the chat hook for full functionality
  const {
    messages: hookMessages,
    isConnected: hookIsConnected,
    isLoading,
    error,
    sendMessage: hookSendMessage,
    clearError
  } = useChat({ autoConnect: true });

  // Use hook data if prop data is not provided
  const messages = propMessages || hookMessages;
  const sendMessage = propSendMessage || hookSendMessage;
  const isConnected = propIsConnected !== undefined ? propIsConnected : hookIsConnected;

  const [inputText, setInputText] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="h-[80vh] max-h-[600px] w-full bg-[#161721] rounded-2xl border-2 border-solid border-[#ffef92] flex flex-col justify-between overflow-hidden">
        <div className="flex flex-row items-center justify-between border-b-2 border-solid border-[#ffef92] px-3 py-2">
          <div className="flex flex-col">
            <span className="text-[#ffef92] font-oswald text-2xl">
              Live Chat Room
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-[#ffef92] opacity-70">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {isLoading && <span className="text-xs text-[#ffef92] opacity-70">Loading...</span>}
            </div>
          </div>
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
            {error && (
              <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
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
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && inputText.trim()) {
                    try {
                      await sendMessage(inputText);
                      setInputText("");
                    } catch (err) {
                      console.error('Failed to send message:', err);
                    }
                  }
                }}
                className="px-2 absolute w-full h-full rounded-xl border-2 border-solid border-[#ffef92] bg-transparent outline-none text-[#ffef92] placeholder-[#808080]"
                placeholder="Write Message..."
              />
              <div className="absolute flex flex-row items-center gap-2 right-2">
                <button
                  onClick={async () => {
                    if (inputText.trim()) {
                      try {
                        await sendMessage(inputText);
                        setInputText("");
                      } catch (err) {
                        console.error('Failed to send message:', err);
                      }
                    }
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
  );
}
