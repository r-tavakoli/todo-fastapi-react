"use client";

import {
  Modal,
  Stack,
  Group,
  Badge,
  Text,
} from "@mantine/core";

import type { Todo, HistoryEntry } from "@/lib/todo-types";

import { getMemberById } from "@/lib/team-members";

interface TaskHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  todo: Todo | null;
  history: HistoryEntry[];
}

function formatFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    title: "Title",
    status: "Status",
    priority: "Priority",
    startDate: "Start Date",
    dueDate: "Due Date",
    assignees: "Assignees",
  };

  return fieldMap[field] ?? field;
}

function formatChangeValue(
  field: string,
  value: string | null
): string {
  if (!value) return "—";

  if (field === "assignees") {
    try {
      const ids = JSON.parse(value);

      return ids
        .map((id: string) => getMemberById(id)?.name ?? id)
        .join(", ");
    } catch {
      return value;
    }
  }

  if (field === "dueDate" || field === "startDate") {
    const date = new Date(value + "T00:00:00");

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return value;
}

function getChangeColor(
  field: string,
  value: string | null
): string {
  if (!value) return "gray";

  if (field === "priority") {
    const colors: Record<string, string> = {
      low: "green",
      medium: "yellow",
      high: "red",
    };

    return colors[value] || "blue";
  }

  if (field === "status") {
    const colors: Record<string, string> = {
      todo: "blue",
      "in-progress": "orange",
      completed: "green",
    };

    return colors[value] || "blue";
  }

  return "blue";
}

function formatChanges(
  entry: HistoryEntry,
  valueType: "oldValue" | "newValue"
): string {
  if (entry.changes.length === 0) {
    return "—";
  }

  const result = entry.changes
    .map((change) => {
      const value = change[valueType];

      if (value == null) {
        return null;
      }

      const fieldName = formatFieldName(change.field);
      const formattedValue = formatChangeValue(
        change.field,
        value
      );

      return `${fieldName}: ${formattedValue}`;
    })
    .filter(Boolean)
    .join(", ");

  return result || "—";
}

export function TaskHistoryModal({
  opened,
  onClose,
  todo,
  history,
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
        ) : history.length === 0 ? (
          <Text c="dimmed" size="sm">
            No history recorded yet.
          </Text>
        ) : (
          history
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
              >
                {/* Header */}
                <Group gap="xs">
                  <Badge size="sm" variant="light">
                    {entry.operation}
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

                {entry.operation === "DELETE" ? (
                  <Text size="sm" c="dimmed">
                    Task deleted
                  </Text>
                ) : (
                  <div className="ml-2 flex flex-col gap-2">
                    {/* From */}
                    <Group gap="xs">
                      <Text
                        size="xs"
                        c="dimmed"
                        className="w-16 shrink-0"
                      >
                        From:
                      </Text>

                      <Badge
                        size="xs"
                        variant="light"
                        color="gray"
                        className="flex-1"
                      >
                        {entry.operation === "CREATE"
                          ? "—"
                          : formatChanges(entry, "oldValue")}
                      </Badge>
                    </Group>

                    {/* To */}
                    <Group gap="xs">
                      <Text
                        size="xs"
                        c="dimmed"
                        className="w-16 shrink-0"
                      >
                        To:
                      </Text>

                      <Badge
                        size="xs"
                        variant="light"
                        color={
                          entry.changes.length === 1
                            ? getChangeColor(
                                entry.changes[0].field,
                                entry.changes[0].newValue
                              )
                            : "blue"
                        }
                        className="flex-1"
                      >
                        {formatChanges(entry, "newValue")}
                      </Badge>
                    </Group>
                  </div>
                )}
              </div>
            ))
        )}
      </Stack>
    </Modal>
  );
}