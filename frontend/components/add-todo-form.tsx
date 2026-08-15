"use client";

import { TextInput, Button, Select, Group, MultiSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconCalendar } from "@/components/icons";
import type { Todo } from "@/lib/todo-types";
import { TEAM_MEMBERS } from "@/lib/team-members";

interface AddTodoFormProps {
  onAdd: (
    title: string,
    priority: Todo["priority"],
    startDate: string | null,
    dueDate: string | null,
    assignees: string[]
  ) => void;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const form = useForm({
    initialValues: {
      title: "",
      priority: "medium" as Todo["priority"],
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
      values.priority,
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
            data={TEAM_MEMBERS.map((m) => ({ value: m.id, label: m.name }))}
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
            data={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            size="md"
            className="w-[130px]"
            allowDeselect={false}
            {...form.getInputProps("priority")}
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
