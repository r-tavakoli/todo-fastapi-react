"use client";

import {
  Modal,
  Stack,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Text,
} from "@mantine/core";
import { useState, useEffect } from "react";
import type { Todo, TodoStatus } from "@/lib/todo-types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/todo-types";
import { TEAM_MEMBERS } from "@/lib/team-members";

interface EditTaskModalProps {
  opened: boolean;
  onClose: () => void;
  todo: Todo | null;
  onSave: (updatedTodo: Partial<Todo>) => void;
}

export function EditTaskModal({
  opened,
  onClose,
  todo,
  onSave,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TodoStatus>("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setStatus(todo.status);
      setPriority(todo.priority);
      setStartDate(todo.startDate || "");
      setDueDate(todo.dueDate || "");
      setAssignees(todo.assignees);
    }
  }, [todo, opened]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      status,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      assignees,
    });

    onClose();
  };

  if (!todo) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Edit Task: "${todo.title}"`}
      size="lg"
    >
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">
            Title
          </Text>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="Enter task title"
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Status
          </Text>
          <Select
            value={status}
            onChange={(value) => setStatus(value as TodoStatus)}
            data={Object.entries(STATUS_LABELS).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Priority
          </Text>
          <Select
            value={priority}
            onChange={(value) =>
              setPriority(value as "low" | "medium" | "high")
            }
            data={Object.entries(PRIORITY_LABELS).map(([key, label]) => ({
              value: key,
              label,
            }))}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Start Date
          </Text>
          <TextInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.currentTarget.value)}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Due Date
          </Text>
          <TextInput
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.currentTarget.value)}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Assignees
          </Text>
          <MultiSelect
            value={assignees}
            onChange={setAssignees}
            data={TEAM_MEMBERS.map((member) => ({
              value: member.id,
              label: member.name,
            }))}
            placeholder="Select team members"
            searchable
          />
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
