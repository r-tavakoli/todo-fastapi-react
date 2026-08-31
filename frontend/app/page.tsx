"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Container, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TodoHeader } from "@/components/todo-header";
import { AddTodoForm } from "@/components/add-todo-form";
import { TodoItem } from "@/components/todo-item";
import { TodoStats } from "@/components/todo-stats";
import { TodoFilters } from "@/components/todo-filters";
import { TodoEmpty } from "@/components/todo-empty";
import { TaskHistoryModal } from "@/components/task-history-modal";
import { EditTaskModal } from "@/components/edit-task-modal";
import type { Todo, FilterType, TodoStatus } from "@/lib/todo-types";
import { STATUS_LABELS } from "@/lib/todo-types";
import type { AppNotification } from "@/lib/notification-types";
import type { ChatConversation, ChatMessage } from "@/lib/chat-types";
import { TEAM_MEMBERS } from "@/lib/team-members";
import { getAllTasks } from "@/lib/api";

const INITIAL_TODOS: Todo[] = [
  {
    id: "1",
    title: "Review project requirements",
    status: "completed",
    priority: "high",
    assignees: ["alice", "bob"],
    startDate: "2026-02-18",
    dueDate: "2026-02-20",
    createdAt: new Date("2026-02-20"),
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-20T10:00:00"),
        changeType: "created",
        oldValue: null,
        newValue: "Review project requirements",
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-20T14:30:00"),
        changeType: "status",
        oldValue: "todo",
        newValue: "in-progress",
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-20T16:45:00"),
        changeType: "status",
        oldValue: "in-progress",
        newValue: "completed",
      },
    ],
  },
  {
    id: "2",
    title: "Design wireframes for dashboard",
    status: "in-progress",
    priority: "high",
    assignees: ["carol"],
    startDate: "2026-02-25",
    dueDate: "2026-02-28",
    createdAt: new Date("2026-02-21"),
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-21T09:00:00"),
        changeType: "created",
        oldValue: null,
        newValue: "Design wireframes for dashboard",
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-25T11:00:00"),
        changeType: "status",
        oldValue: "todo",
        newValue: "in-progress",
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-25T13:00:00"),
        changeType: "priority",
        oldValue: "medium",
        newValue: "high",
      },
    ],
  },
  {
    id: "3",
    title: "Set up CI/CD pipeline",
    status: "todo",
    priority: "medium",
    assignees: ["dave", "eve", "alice"],
    startDate: "2026-03-01",
    dueDate: "2026-03-05",
    createdAt: new Date("2026-02-22"),
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-22T08:30:00"),
        changeType: "created",
        oldValue: null,
        newValue: "Set up CI/CD pipeline",
      },
    ],
  },
  {
    id: "4",
    title: "Write API documentation",
    status: "todo",
    priority: "low",
    assignees: ["bob"],
    startDate: null,
    dueDate: null,
    createdAt: new Date("2026-02-23"),
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-23T15:00:00"),
        changeType: "created",
        oldValue: null,
        newValue: "Write API documentation",
      },
    ],
  },
  {
    id: "5",
    title: "Team sync meeting",
    status: "completed",
    priority: "medium",
    assignees: ["alice", "bob", "carol", "dave"],
    startDate: "2026-02-24",
    dueDate: "2026-02-24",
    createdAt: new Date("2026-02-24"),
    history: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-24T09:00:00"),
        changeType: "created",
        oldValue: null,
        newValue: "Team sync meeting",
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date("2026-02-24T17:00:00"),
        changeType: "status",
        oldValue: "todo",
        newValue: "completed",
      },
    ],
  },
];


export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTodoForHistory, setSelectedTodoForHistory] = useState<Todo | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTodoForEdit, setSelectedTodoForEdit] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);

        const tasks = await getAllTasks();

        setTodos(tasks);
      } catch (error) {
        console.error(error);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);  

  
  const addNotification = useCallback((title: string, message: string, color: string) => {
    const newNotif: AppNotification = {
      id: crypto.randomUUID(),
      title,
      message,
      color,
      timestamp: new Date(),
      read: false,
    };
    setAppNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setAppNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  // Chat state
  const [conversations, setConversations] = useState<ChatConversation[]>(() =>
    TEAM_MEMBERS.map((member) => ({
      id: member.id,
      memberId: member.id,
      memberName: member.name,
      memberColor: member.color,
      messages: [],
      unreadCount: 0,
    }))
  );

  const handleSendMessage = useCallback((conversationId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId,
      senderId: "user",
      text,
      timestamp: new Date(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMsg] }
          : c
      )
    );
  }, []);

  const handleMarkConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  const filteredTodos = useMemo(() => {
    if (filter === "all") return todos;
    return todos.filter((t) => t.status === filter);
  }, [todos, filter]);

  const handleAdd = (title: string, priority: Todo["priority"], startDate: string | null, dueDate: string | null, assignees: string[]) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title,
      status: "todo",
      priority,
      assignees,
      startDate,
      dueDate,
      createdAt: new Date(),
      history: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          changeType: "created",
          oldValue: null,
          newValue: title,
        },
      ],
    };
    setTodos((prev) => [newTodo, ...prev]);
    addNotification("Task added", `"${title}" has been added to your list.`, "indigo");
    notifications.show({
      title: "Task added",
      message: `"${title}" has been added to your list.`,
      color: "indigo",
    });
  };

  const handleStatusChange = (id: string, status: TodoStatus) => {
    const todo = todos.find((t) => t.id === id);
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status,
            history: [
              ...t.history,
              {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                changeType: "status",
                oldValue: t.status,
                newValue: status,
              },
            ],
          };
        }
        return t;
      })
    );
    if (todo) {
      addNotification("Status updated", `"${todo.title}" moved to ${STATUS_LABELS[status]}.`, "indigo");
      notifications.show({
        title: "Status updated",
        message: `"${todo.title}" moved to ${STATUS_LABELS[status]}.`,
        color: "indigo",
      });
    }
  };

  const handleDelete = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (todo) {
      addNotification("Task deleted", `"${todo.title}" has been permanently removed.`, "red");
      notifications.show({
        title: "Task deleted",
        message: `"${todo.title}" has been permanently removed.`,
        color: "red",
      });
    }
  };

  const handleOpenEdit = (todo: Todo) => {
    setSelectedTodoForEdit(todo);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (updatedFields: Partial<Todo>) => {
    if (!selectedTodoForEdit) return;

    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === selectedTodoForEdit.id) {
          const history: any[] = [];

          // Track title changes
          if (updatedFields.title && updatedFields.title !== t.title) {
            history.push({
              id: crypto.randomUUID(),
              timestamp: new Date(),
              changeType: "title",
              oldValue: t.title,
              newValue: updatedFields.title,
            });
          }

          // Track status changes
          if (updatedFields.status && updatedFields.status !== t.status) {
            history.push({
              id: crypto.randomUUID(),
              timestamp: new Date(),
              changeType: "status",
              oldValue: t.status,
              newValue: updatedFields.status,
            });
          }

          // Track priority changes
          if (updatedFields.priority && updatedFields.priority !== t.priority) {
            history.push({
              id: crypto.randomUUID(),
              timestamp: new Date(),
              changeType: "priority",
              oldValue: t.priority,
              newValue: updatedFields.priority,
            });
          }

          // Track due date changes
          if (updatedFields.dueDate !== undefined && updatedFields.dueDate !== t.dueDate) {
            history.push({
              id: crypto.randomUUID(),
              timestamp: new Date(),
              changeType: "dueDate",
              oldValue: t.dueDate,
              newValue: updatedFields.dueDate,
            });
          }

          // Track start date changes
          if (updatedFields.startDate !== undefined && updatedFields.startDate !== t.startDate) {
            history.push({
              id: crypto.randomUUID(),
              timestamp: new Date(),
              changeType: "startDate",
              oldValue: t.startDate,
              newValue: updatedFields.startDate,
            });
          }

          // Track assignee changes
          if (
            updatedFields.assignees &&
            JSON.stringify(updatedFields.assignees) !== JSON.stringify(t.assignees)
          ) {
            history.push({
              id: crypto.randomUUID(),
              timestamp: new Date(),
              changeType: "assignees",
              oldValue: JSON.stringify(t.assignees),
              newValue: JSON.stringify(updatedFields.assignees),
            });
          }

          return {
            ...t,
            ...updatedFields,
            history: [...t.history, ...history],
          };
        }
        return t;
      })
    );

    addNotification("Task updated", "Task has been updated successfully.", "blue");
    notifications.show({
      title: "Task updated",
      message: "Task has been updated successfully.",
      color: "blue",
    });

    setEditModalOpen(false);
  };

  const handleOpenHistory = (todo: Todo) => {
    setSelectedTodoForHistory(todo);
    setHistoryModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TodoHeader
        notifications={appNotifications}
        onMarkAllRead={handleMarkAllRead}
        conversations={conversations}
        onSendMessage={handleSendMessage}
        onMarkConversationRead={handleMarkConversationRead}
      />
      <EditTaskModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        todo={selectedTodoForEdit}
        onSave={handleSaveEdit}
      />
      <TaskHistoryModal
        opened={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        todo={selectedTodoForHistory}
      />
      <main className="flex-1 py-8">
        <Container size="md">
          <Stack gap="lg">
            <TodoStats todos={todos} />
            <AddTodoForm onAdd={handleAdd} />
            <TodoFilters
              filter={filter}
              onFilterChange={setFilter}
            />
            {filteredTodos.length === 0 ? (
              <TodoEmpty filter={filter} />
            ) : (
              <Stack gap="xs">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onOpenEdit={handleOpenEdit}
                    onOpenHistory={handleOpenHistory}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </main>
    </div>
  );
}
