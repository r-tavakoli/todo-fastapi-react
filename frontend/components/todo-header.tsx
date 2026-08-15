"use client";

import {
  Group,
  Title,
  Button,
  Text,
  Avatar,
  Menu,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconLogout, IconClipboard, IconLock } from "@/components/icons";
import { NotificationPanel } from "@/components/notification-panel";
import { ChatPanel } from "@/components/chat-panel";
import type { AppNotification } from "@/lib/notification-types";
import type { ChatConversation } from "@/lib/chat-types";

interface TodoHeaderProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  conversations: ChatConversation[];
  onSendMessage: (conversationId: string, text: string) => void;
  onMarkConversationRead: (conversationId: string) => void;
}

export function TodoHeader({
  notifications,
  onMarkAllRead,
  conversations,
  onSendMessage,
  onMarkConversationRead,
}: TodoHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <Group justify="space-between">
        <Group gap="sm">
          <IconClipboard size={28} />
          <Title order={3} className="font-sans text-card-foreground">
            TaskFlow
          </Title>
        </Group>
        <Group gap="md">
          <NotificationPanel
            notifications={notifications}
            onMarkAllRead={onMarkAllRead}
          />
          <ChatPanel
            conversations={conversations}
            onSendMessage={onSendMessage}
            onMarkConversationRead={onMarkConversationRead}
          />
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="subtle" className="px-2">
                <Group gap="xs">
                  <Avatar size="sm" color="indigo" radius="xl">
                    U
                  </Avatar>
                  <Text size="sm" className="hidden sm:block">
                    User
                  </Text>
                </Group>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item
                leftSection={<IconLock size={16} />}
                onClick={() => router.push("/change-password")}
              >
                Change password
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                onClick={() => router.push("/login")}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </header>
  );
}
