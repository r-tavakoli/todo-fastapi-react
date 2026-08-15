"use client";

import {
  Modal,
  Stack,
  Group,
  Badge,
  Text,
} from "@mantine/core";
import type { Todo, HistoryEntry } from "@/lib/todo-types";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/todo-types";
import { getMemberById, TEAM_MEMBERS } from "@/lib/team-members";

interface TaskHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  todo: Todo | null;
}

function formatChangeType(changeType: string): string {
  const typeMap: Record<string, string> = {
    created: "Created",
    title: "Title",
    status: "Status",
    priority: "Priority",
    dueDate: "Due Date",
    startDate: "Start Date",
    assignees: "Assignees",
  };
  return typeMap[changeType] || changeType;
}

function formatChangeValue(changeType: string, value: string | null): string {
  if (!value) return "—";

  if (changeType === "priority") {
    const labels: Record<string, string> = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };
    return labels[value] || value;
  }

  if (changeType === "status") {
    const labels: Record<string, string> = {
      todo: "Todo",
      "in-progress": "In Progress",
      completed: "Completed",
    };
    return labels[value] || value;
  }

  if (changeType === "assignees") {
    try {
      const ids = JSON.parse(value);
      return ids
        .map((id: string) => getMemberById(id)?.name ?? id)
        .join(", ");
    } catch {
      return value;
    }
  }

  if (changeType === "dueDate" || changeType === "startDate") {
    const date = new Date(value + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return value;
}

function getChangeColor(changeType: string, value: string | null): string {
  if (!value) return "gray";

  if (changeType === "priority") {
    const colors: Record<string, string> = {
      low: "green",
      medium: "yellow",
      high: "red",
    };
    return colors[value] || "blue";
  }

  if (changeType === "status") {
    const colors: Record<string, string> = {
      todo: "blue",
      "in-progress": "orange",
      completed: "green",
    };
    return colors[value] || "blue";
  }

  return "blue";
}

export function TaskHistoryModal({
  opened,
  onClose,
  todo,
}: TaskHistoryModalProps) {

  return (
    <Modal
      opened={opened && !!todo}
      onClose={onClose}
      title={todo ? `History: "${todo.title}"` : "History"}
      size="lg"
    >
      <Stack gap="md" className="max-h-96 overflow-y-auto">
        {!todo ? (
          <Text c="dimmed" size="sm">
            No task selected.
          </Text>
        ) : todo.history.length === 0 ? (
          <Text c="dimmed" size="sm">
            No history recorded yet.
          </Text>
        ) : (
          todo
            ? todo.history
                .slice()
                .reverse()
                .map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
              >
                <Group gap="xs">
                  <Badge size="sm" variant="light">
                    {formatChangeType(entry.changeType)}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {entry.timestamp.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Group>

                <div className="ml-2 flex flex-col gap-2">
                  {entry.oldValue && (
                    <Group gap="xs">
                      <Text size="xs" c="dimmed" className="w-16">
                        From:
                      </Text>
                      <Badge
                        size="xs"
                        variant="light"
                        color="gray"
                        className="flex-1"
                      >
                        {formatChangeValue(entry.changeType, entry.oldValue)}
                      </Badge>
                    </Group>
                  )}

                  <Group gap="xs">
                    <Text size="xs" c="dimmed" className="w-16">
                      To:
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={getChangeColor(entry.changeType, entry.newValue)}
                      className="flex-1"
                    >
                      {formatChangeValue(entry.changeType, entry.newValue)}
                    </Badge>
                  </Group>
                </div>
              </div>
            ))
            : null
        )}
      </Stack>
    </Modal>
  );
}
