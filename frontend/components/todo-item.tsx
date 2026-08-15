"use client";

import {
  Text,
  ActionIcon,
  Group,
  Badge,
  Paper,
  TextInput,
  Tooltip,
  Menu,
  Avatar,
} from "@mantine/core";
import { useState } from "react";
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconCalendar,
  IconCircle,
  IconLoader,
  IconHistory,
} from "@/components/icons";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/todo-types";
import type { Todo, TodoStatus } from "@/lib/todo-types";
import { getMemberById } from "@/lib/team-members";

interface TodoItemProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onOpenEdit: (todo: Todo) => void;
  onOpenHistory: (todo: Todo) => void;
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isDueOrOverdue(dateStr: string): "overdue" | "today" | "upcoming" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "upcoming";
}

const DUE_COLORS = {
  overdue: "red",
  today: "orange",
  upcoming: "gray",
} as const;

const STATUS_ICONS: Record<TodoStatus, React.ReactNode> = {
  todo: <IconCircle size={16} />,
  "in-progress": <IconLoader size={16} />,
  completed: <IconCheck size={16} />,
};

export function TodoItem({ todo, onStatusChange, onDelete, onOpenEdit, onOpenHistory }: TodoItemProps) {
  const isCompleted = todo.status === "completed";

  return (
    <Paper
      className={`border border-border bg-card p-4 transition-all hover:shadow-sm ${
        isCompleted ? "opacity-60" : ""
      }`}
      radius="md"
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="md" wrap="nowrap" className="min-w-0 flex-1">
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <Tooltip label={STATUS_LABELS[todo.status]}>
                <ActionIcon
                  variant="light"
                  color={STATUS_COLORS[todo.status]}
                  size="lg"
                  radius="xl"
                  aria-label={`Status: ${STATUS_LABELS[todo.status]}. Click to change.`}
                >
                  {STATUS_ICONS[todo.status]}
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Change status</Menu.Label>
              {(Object.keys(STATUS_LABELS) as TodoStatus[]).map((s) => (
                <Menu.Item
                  key={s}
                  leftSection={STATUS_ICONS[s]}
                  onClick={() => onStatusChange(todo.id, s)}
                  color={STATUS_COLORS[s]}
                  disabled={todo.status === s}
                >
                  {STATUS_LABELS[s]}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Text
              size="md"
              td={isCompleted ? "line-through" : undefined}
              c={isCompleted ? "dimmed" : undefined}
              className="truncate"
            >
              {todo.title}
            </Text>
            <Badge
              size="sm"
              variant="light"
              color={PRIORITY_COLORS[todo.priority]}
              className="shrink-0"
            >
              {PRIORITY_LABELS[todo.priority]}
            </Badge>
            <Badge
              size="sm"
              variant="dot"
              color={STATUS_COLORS[todo.status]}
              className="shrink-0"
            >
              {STATUS_LABELS[todo.status]}
            </Badge>
          </div>
        </Group>
        <Group gap="sm" wrap="nowrap" className="shrink-0">
          {todo.assignees.length > 0 && (
            <Tooltip
              label={todo.assignees
                .map((id) => getMemberById(id)?.name ?? id)
                .join(", ")}
            >
              <Avatar.Group spacing="sm">
                {todo.assignees.slice(0, 3).map((id) => {
                  const member = getMemberById(id);
                  return (
                    <Avatar
                      key={id}
                      size="sm"
                      radius="xl"
                      color={member?.color ?? "gray"}
                    >
                      {(member?.name ?? id).charAt(0).toUpperCase()}
                    </Avatar>
                  );
                })}
                {todo.assignees.length > 3 && (
                  <Avatar size="sm" radius="xl" color="gray">
                    +{todo.assignees.length - 3}
                  </Avatar>
                )}
              </Avatar.Group>
            </Tooltip>
          )}
          {(todo.startDate || todo.dueDate) && (
            <div className="flex flex-col items-end gap-1">
              {todo.startDate && (
                <Tooltip label={`Start: ${formatDueDate(todo.startDate)}`}>
                  <Badge
                    size="sm"
                    variant="light"
                    color="indigo"
                    leftSection={<IconCalendar size={12} />}
                    className="cursor-default"
                  >
                    {formatDueDate(todo.startDate)}
                  </Badge>
                </Tooltip>
              )}
              {todo.dueDate && !isCompleted && (
                <Tooltip label={`Due: ${formatDueDate(todo.dueDate)}`}>
                  <Badge
                    size="sm"
                    variant="light"
                    color={DUE_COLORS[isDueOrOverdue(todo.dueDate)]}
                    leftSection={<IconCalendar size={12} />}
                    className="cursor-default"
                  >
                    {formatDueDate(todo.dueDate)}
                  </Badge>
                </Tooltip>
              )}
              {todo.dueDate && isCompleted && (
                <Badge
                  size="sm"
                  variant="light"
                  color="gray"
                  leftSection={<IconCalendar size={12} />}
                >
                  {formatDueDate(todo.dueDate)}
                </Badge>
              )}
            </div>
          )}
        </Group>
        <Group gap="sm" wrap="nowrap" className="shrink-0">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onOpenEdit(todo)}
            aria-label={`Edit "${todo.title}"`}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <Tooltip label="View history">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => onOpenHistory(todo)}
              aria-label={`View history for "${todo.title}"`}
            >
              <IconHistory size={16} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.title}"`}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}
