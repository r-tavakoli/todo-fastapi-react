"use client";

import { Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCheck, IconClipboard, IconCircle, IconLoader } from "@/components/icons";
import type { FilterType } from "@/lib/todo-types";

interface TodoEmptyProps {
  filter: FilterType;
}

export function TodoEmpty({ filter }: TodoEmptyProps) {
  const messages: Record<FilterType, { title: string; description: string; icon: React.ReactNode; color: string }> = {
    all: {
      title: "No tasks yet",
      description: "Add your first task above to get started.",
      icon: <IconClipboard size={28} />,
      color: "indigo",
    },
    todo: {
      title: "No pending tasks",
      description: "All tasks have been moved to other stages.",
      icon: <IconCircle size={28} />,
      color: "blue",
    },
    "in-progress": {
      title: "Nothing in progress",
      description: "Move tasks to 'In Progress' when you start working on them.",
      icon: <IconLoader size={28} />,
      color: "orange",
    },
    completed: {
      title: "Nothing completed yet",
      description: "Complete some tasks and they will appear here.",
      icon: <IconCheck size={28} />,
      color: "green",
    },

  };

  const { title, description, icon, color } = messages[filter];

  return (
    <Stack align="center" gap="md" className="py-12">
      <ThemeIcon size={56} variant="light" color={color} radius="xl">
        {icon}
      </ThemeIcon>
      <div className="text-center">
        <Text size="lg" fw={600}>
          {title}
        </Text>
        <Text size="sm" c="dimmed" className="mt-1">
          {description}
        </Text>
      </div>
    </Stack>
  );
}
