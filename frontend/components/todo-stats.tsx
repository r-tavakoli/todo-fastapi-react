"use client";

import { Paper, Text, RingProgress, Group, Stack, Badge, Divider } from "@mantine/core";
import type { Todo } from "@/lib/todo-types";

interface TodoStatsProps {
  todos: Todo[];
}

export function TodoStats({ todos }: TodoStatsProps) {
  const total = todos.length;
  const todoCount = todos.filter((t) => t.status === "todo").length;
  const inProgressCount = todos.filter(
    (t) => t.status === "in-progress"
  ).length;
  const completedCount = todos.filter(
    (t) => t.status === "completed"
  ).length;
  const completedPercentage =
    total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Average completion time (days between createdAt and today for completed tasks)
  const completedTodos = todos.filter((t) => t.status === "completed");
  const avgCompletionDays =
    completedTodos.length > 0
      ? Math.round(
          completedTodos.reduce((sum, t) => {
            const diffMs = Date.now() - new Date(t.createdAt).getTime();
            return sum + diffMs / (1000 * 60 * 60 * 24);
          }, 0) / completedTodos.length
        )
      : 0;
  const avgRingValue = Math.min((avgCompletionDays / 30) * 100, 100);

  // Overdue tasks (non-completed tasks whose dueDate is in the past)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTodos = todos.filter((t) => {
    if (t.status === "completed" || !t.dueDate) return false;
    return new Date(t.dueDate) < today;
  });
  const overdueCount = overdueTodos.length;
  const nonCompletedWithDate = todos.filter(
    (t) => t.status !== "completed" && t.dueDate
  ).length;
  const overduePercentage =
    nonCompletedWithDate > 0
      ? Math.round((overdueCount / nonCompletedWithDate) * 100)
      : 0;

  return (
    <Paper className="border border-border bg-card p-5" radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        {/* Left: counts */}
        <Stack gap="md" className="flex-1">
          <Group gap="sm" align="center">
            <Text size="lg" fw={600} className="text-card-foreground">
              Overview
            </Text>
            <Badge size="lg" variant="light" color="indigo" radius="sm">
              {total} {total === 1 ? "task" : "tasks"}
            </Badge>
          </Group>

          <Group gap="lg" wrap="wrap">
            <Stack gap={2} align="center">
              <Text size="xl" fw={700} c="blue">
                {todoCount}
              </Text>
              <Text size="xs" c="dimmed">
                Todo
              </Text>
            </Stack>
            <Stack gap={2} align="center">
              <Text size="xl" fw={700} c="orange">
                {inProgressCount}
              </Text>
              <Text size="xs" c="dimmed">
                In Progress
              </Text>
            </Stack>
            <Stack gap={2} align="center">
              <Text size="xl" fw={700} c="green">
                {completedCount}
              </Text>
              <Text size="xs" c="dimmed">
                Completed
              </Text>
            </Stack>
          </Group>
        </Stack>

        {/* Right: three ring charts side by side */}
        <Group gap="xl" wrap="nowrap" className="shrink-0">
          <Stack gap={4} align="center">
            <RingProgress
              size={80}
              thickness={8}
              roundCaps
              sections={[{ value: completedPercentage, color: "green" }]}
              label={
                <Text ta="center" fw={700} size="xs">
                  {completedPercentage}%
                </Text>
              }
            />
            <Text size="xs" c="dimmed">
              Completed
            </Text>
          </Stack>

          <Divider orientation="vertical" />

          <Stack gap={4} align="center">
            <RingProgress
              size={80}
              thickness={8}
              roundCaps
              sections={[{ value: avgRingValue, color: "indigo" }]}
              label={
                <Text ta="center" fw={700} size="xs">
                  {avgCompletionDays}d
                </Text>
              }
            />
            <Text size="xs" c="dimmed">
              {completedTodos.length > 0
                ? `${avgCompletionDays} ${avgCompletionDays === 1 ? "day" : "days"} avg`
                : "No data"}
            </Text>
          </Stack>

          <Divider orientation="vertical" />

          <Stack gap={4} align="center">
            <RingProgress
              size={80}
              thickness={8}
              roundCaps
              sections={[{ value: overduePercentage, color: "red" }]}
              label={
                <Text
                  ta="center"
                  fw={700}
                  size="xs"
                  c={overdueCount > 0 ? "red" : undefined}
                >
                  {overdueCount}
                </Text>
              }
            />
            <Text size="xs" c="dimmed">
              {overdueCount > 0
                ? `${overdueCount} overdue`
                : "On track"}
            </Text>
          </Stack>
        </Group>
      </Group>
    </Paper>
  );
}
