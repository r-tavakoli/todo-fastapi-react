"use client";

import { TextInput, Button, Select, Group, MultiSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconCalendar } from "@/components/icons";
import type { Todo } from "@/lib/todo-types";
import { TEAM_MEMBERS } from "@/lib/team-members";
import { useEffect, useState } from "react";
import { TaskPriorityResponse, getPriorities, getUsers, UserResponse } from "@/lib/api";


interface AddTodoFormProps {
  onAdd: (
    title: string,
    priorityId: string,
    startDate: string | null,
    dueDate: string | null,
    assignees: string[]
  ) => void;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {

  const [priorities, setPriorities] = useState<TaskPriorityResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);  
  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [priorityData, userData] = await Promise.all([
          getPriorities(),
          getUsers(),
        ]);
  
        setPriorities(priorityData);
        setUsers(userData);
  
        const defaultPriority = priorityData.find(
          (priority) => priority.is_default
        );
  
        if (defaultPriority) {
          form.setFieldValue(
            "priorityId",
            String(defaultPriority.id)
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    loadReferenceData();
  }, []);

  

  
  const form = useForm({
    initialValues: {
      title: "",
      priorityId: "",
      startDate: "",
      dueDate: "",
      assignees: [] as string[],
    },
    validate: {
      title: (value) =>
        value.trim().length > 0 ? null : "Task title is required",
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    onAdd(
      values.title.trim(),
      values.priorityId,
      values.startDate || null,
      values.dueDate || null,
      values.assignees
    );
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className="flex flex-col gap-3">
        <TextInput
          placeholder="What needs to be done?"
          size="md"
          className="w-full"
          {...form.getInputProps("title")}
        />
        <Group gap="sm" align="flex-end">
          <MultiSelect
            data={users.map((user) => ({
              value: String(user.id),
              label: `${user.first_name}`,
            }))}
            placeholder="Assignees"
            size="md"
            className="flex-1"
            maxDropdownHeight={200}
            clearable
            searchable
            {...form.getInputProps("assignees")}
          />
          <TextInput
            type="date"
            size="md"
            className="w-[160px]"
            leftSection={<IconCalendar size={16} />}
            placeholder="Start date"
            {...form.getInputProps("startDate")}
          />
          <TextInput
            type="date"
            size="md"
            className="w-[160px]"
            leftSection={<IconCalendar size={16} />}
            {...form.getInputProps("dueDate")}
          />
          <Select
            data={priorities
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((priority) => ({
                value: String(priority.id),
                label: priority.title,
              }))}
            size="md"
            className="w-[130px]"
            allowDeselect={false}
            {...form.getInputProps("priorityId")}
          />
          <Button
            type="submit"
            size="md"
            color="indigo"
            leftSection={<IconPlus size={18} />}
          >
            Add
          </Button>
        </Group>
      </div>
    </form>
  );
}
