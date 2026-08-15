"use client";

import { SegmentedControl } from "@mantine/core";
import type { FilterType } from "@/lib/todo-types";

interface TodoFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function TodoFilters({ filter, onFilterChange }: TodoFiltersProps) {
  return (
    <SegmentedControl
      value={filter}
      onChange={(val) => onFilterChange(val as FilterType)}
      data={[
        { label: "All", value: "all" },
        { label: "Todo", value: "todo" },
        { label: "In Progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
      ]}
      color="indigo"
      size="sm"
    />
  );
}
