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
  Button,
} from "@mantine/core";
import { useState } from "react";
import { IconBell } from "@/components/icons";
import type { AppNotification } from "@/lib/notification-types";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
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

export function NotificationPanel({
  notifications,
  onMarkAllRead,
}: NotificationPanelProps) {
  const [opened, setOpened] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (isOpen: boolean) => {
    setOpened(isOpen);
  };

  return (
    <Popover
      width={360}
      position="bottom-end"
      shadow="lg"
      opened={opened}
      onChange={handleOpen}
    >
      <Popover.Target>
        <Indicator
          label={unreadCount > 0 ? unreadCount : undefined}
          size={unreadCount > 0 ? 18 : 0}
          color="red"
          offset={4}
          processing={unreadCount > 0}
          disabled={unreadCount === 0}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => setOpened((o) => !o)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown className="p-0">
        <div className="border-b border-border px-4 py-3">
          <Group justify="space-between">
            <Group gap="xs">
              <Text fw={600} size="sm">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Badge size="sm" color="red" variant="filled">
                  {unreadCount}
                </Badge>
              )}
            </Group>
            {unreadCount > 0 && (
              <Button
                variant="subtle"
                size="xs"
                color="indigo"
                onClick={onMarkAllRead}
              >
                Mark all read
              </Button>
            )}
          </Group>
        </div>
        <ScrollArea.Autosize mah={320}>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Text size="sm" c="dimmed">
                No notifications yet
              </Text>
            </div>
          ) : (
            <Stack gap={0}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-border px-4 py-3 transition-colors ${
                    !notification.read
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                      : ""
                  }`}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <div className="min-w-0 flex-1">
                      <Group gap="xs" mb={2}>
                        <Text size="sm" fw={notification.read ? 400 : 600} truncate>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <div className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        )}
                      </Group>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {notification.message}
                      </Text>
                    </div>
                    <Text size="xs" c="dimmed" className="shrink-0">
                      {timeAgo(notification.timestamp)}
                    </Text>
                  </Group>
                </div>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Popover.Dropdown>
    </Popover>
  );
}
