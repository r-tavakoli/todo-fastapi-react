"use client";

import {
  ActionIcon,
  Indicator,
  Popover,
  Text,
  Stack,
  Group,
  Badge,
  ScrollArea,
  Avatar,
  TextInput,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { IconMail, IconSend, IconArrowLeft } from "@/components/icons";
import type { ChatConversation, ChatMessage } from "@/lib/chat-types";

interface ChatPanelProps {
  conversations: ChatConversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  onMarkConversationRead: (conversationId: string) => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ConversationList({
  conversations,
  onSelect,
}: {
  conversations: ChatConversation[];
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollArea.Autosize mah={380}>
      {conversations.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Text size="sm" c="dimmed">
            No conversations yet
          </Text>
        </div>
      ) : (
        <Stack gap={0}>
          {conversations.map((conv) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                  conv.unreadCount > 0
                    ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                    : ""
                }`}
              >
                <Avatar size="sm" color={conv.memberColor} radius="xl">
                  {conv.memberName.charAt(0)}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Group justify="space-between" wrap="nowrap" mb={2}>
                    <Text
                      size="sm"
                      fw={conv.unreadCount > 0 ? 600 : 400}
                      truncate
                      className="text-foreground"
                    >
                      {conv.memberName}
                    </Text>
                    {lastMsg && (
                      <Text size="xs" c="dimmed" className="shrink-0">
                        {timeAgo(lastMsg.timestamp)}
                      </Text>
                    )}
                  </Group>
                  <Group justify="space-between" wrap="nowrap">
                    <Text
                      size="xs"
                      c="dimmed"
                      truncate
                      className="flex-1"
                    >
                      {lastMsg
                        ? `${lastMsg.senderId === "user" ? "You: " : ""}${lastMsg.text}`
                        : "Start a conversation"}
                    </Text>
                    {conv.unreadCount > 0 && (
                      <Badge
                        size="sm"
                        color="red"
                        variant="filled"
                        className="shrink-0"
                      >
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </Group>
                </div>
              </button>
            );
          })}
        </Stack>
      )}
    </ScrollArea.Autosize>
  );
}

function ChatThread({
  conversation,
  onBack,
  onSend,
}: {
  conversation: ChatConversation;
  onBack: () => void;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [conversation.messages.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[420px] flex-col">
      {/* Thread header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <ActionIcon variant="subtle" size="sm" onClick={onBack} aria-label="Back to conversations">
          <IconArrowLeft size={16} />
        </ActionIcon>
        <Avatar size="sm" color={conversation.memberColor} radius="xl">
          {conversation.memberName.charAt(0)}
        </Avatar>
        <Text size="sm" fw={600} className="text-foreground">
          {conversation.memberName}
        </Text>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" viewportRef={viewportRef} ref={scrollRef}>
        <div className="flex flex-col gap-2 px-3 py-3">
          {conversation.messages.length === 0 ? (
            <div className="py-8 text-center">
              <Text size="xs" c="dimmed">
                Send a message to start the conversation
              </Text>
            </div>
          ) : (
            conversation.messages.map((msg: ChatMessage) => {
              const isMe = msg.senderId === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-3 py-2 ${
                      isMe
                        ? "bg-indigo-600 text-white"
                        : "bg-accent text-foreground"
                    }`}
                  >
                    <Text size="sm" className={isMe ? "text-white" : "text-foreground"}>
                      {msg.text}
                    </Text>
                    <Text
                      size="xs"
                      className={`mt-0.5 ${
                        isMe ? "text-indigo-200" : "text-muted-foreground"
                      }`}
                    >
                      {timeAgo(msg.timestamp)}
                    </Text>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border px-3 py-2">
        <Group gap="xs" wrap="nowrap">
          <TextInput
            placeholder="Type a message..."
            size="sm"
            className="flex-1"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
          <ActionIcon
            size="lg"
            color="indigo"
            variant="filled"
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Send message"
          >
            <IconSend size={16} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  );
}

export function ChatPanel({
  conversations,
  onSendMessage,
  onMarkConversationRead,
}: ChatPanelProps) {
  const [opened, setOpened] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    onMarkConversationRead(id);
  };

  const handleBack = () => {
    setActiveConversationId(null);
  };

  const handleSend = (text: string) => {
    if (activeConversationId) {
      onSendMessage(activeConversationId, text);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpened(isOpen);
    if (!isOpen) {
      setActiveConversationId(null);
    }
  };

  return (
    <Popover
      width={360}
      position="bottom-end"
      shadow="lg"
      opened={opened}
      onChange={handleOpenChange}
    >
      <Popover.Target>
        <Indicator
          label={totalUnread > 0 ? totalUnread : undefined}
          size={totalUnread > 0 ? 18 : 0}
          color="red"
          offset={4}
          processing={totalUnread > 0}
          disabled={totalUnread === 0}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => setOpened((o) => !o)}
            aria-label={`Messages${totalUnread > 0 ? `, ${totalUnread} unread` : ""}`}
          >
            <IconMail size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown className="p-0">
        {!activeConversation ? (
          <>
            <div className="border-b border-border px-4 py-3">
              <Group justify="space-between">
                <Group gap="xs">
                  <Text fw={600} size="sm">
                    Messages
                  </Text>
                  {totalUnread > 0 && (
                    <Badge size="sm" color="red" variant="filled">
                      {totalUnread}
                    </Badge>
                  )}
                </Group>
              </Group>
            </div>
            <ConversationList
              conversations={conversations}
              onSelect={handleSelectConversation}
            />
          </>
        ) : (
          <ChatThread
            conversation={activeConversation}
            onBack={handleBack}
            onSend={handleSend}
          />
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
