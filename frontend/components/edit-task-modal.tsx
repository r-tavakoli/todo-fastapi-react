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
import type { Todo, TodoPriority, TodoStatus } from "@/lib/todo-types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/todo-types";
import { TEAM_MEMBERS } from "@/lib/team-members";
import { getPriorities, getStatuses, type TaskStatusResponse, type TaskPriorityResponse } from "@/lib/api";

interface EditTaskModalProps {
  opened: boolean;
  onClose: () => void;
  todo: Todo | null;
  onSave: (updatedTodo: Partial<Todo>) => void;
  priorities: TaskPriorityResponse[];
  statuses: TaskStatusResponse[];
}

export function EditTaskModal({
  opened,
  onClose,
  todo,
  onSave,
  priorities,
  statuses,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TodoStatus>("todo");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  // const [priorities, setPriorities] = useState<TaskPriorityResponse[]>([]);
  // const [statuses, setStatuses] = useState<TaskStatusResponse[]>([]);

  // useEffect(() => {
  //   async function loadPriorities() {
  //     try {
  //       const data = await getPriorities();
  //       setPriorities(data);
  //     } catch (error) {
  //       console.error("Failed to load priorities:", error);
  //     }
  //   };
  //   loadPriorities();
  // }, []);

  
  // useEffect(() => {
  //   async function loadStatuses() {
  //     try {
  //       const data = await getStatuses();
  //       setStatuses(data);
  //     } catch (error) {
  //       console.error("Failed to load statuses:", error);
  //     }
  //   };
  //   loadStatuses();
  // }, []);
  
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
  
    const selectedPriority = priorities.find(
      (p) => p.title.toLowerCase() === priority
    );
  
    if (!selectedPriority) {
      return;
    }
  
    const selectedStatus = statuses.find(
      (s) => s.title.toLowerCase().replace(" ", "-") === status
    );
  
    if (!selectedStatus) {
      return;
    }
  
    const updatedFields = {
      title: title.trim(),
      status,
      statusId: selectedStatus.id,
      priority,
      priorityId: selectedPriority.id,
      startDate: startDate,
      dueDate: dueDate,
    };
  
    console.log("Calling onSave:", updatedFields);
  
    onSave(updatedFields);
  
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
          onChange={(value) =>
            setStatus(value as TodoStatus)
          }
          data={statuses.map((status) => ({
            value: status.title.toLowerCase().replace(" ", "-"),
            label: status.title,
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
              setPriority(value as TodoPriority)
            }
            // here
            data={priorities.map((priority) => ({
              value: priority.title.toLowerCase().replace(" ", "-"),
              label: priority.title,
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
