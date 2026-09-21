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
import type { Todo, FilterType, TodoStatus, HistoryEntry } from "@/lib/todo-types";
import { STATUS_LABELS } from "@/lib/todo-types";
import type { AppNotification } from "@/lib/notification-types";
import type { ChatConversation, ChatMessage } from "@/lib/chat-types";
import { TEAM_MEMBERS } from "@/lib/team-members";
import {
  getAllTasks,
  addTask,
  updateTask,
  deleteTask,
  getPriorities,
  getStatuses,
  TaskPriorityResponse,
  TaskStatusResponse,
  getTaskHistory,
  mapHistoryToEntries,
  UserResponse,
  getUsers
} from "@/lib/api";

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
  const [priorities, setPriorities] = useState<TaskPriorityResponse[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusResponse[]>([]);
  const [assignees, setAssignees] = useState<UserResponse[]>([]);
  const [taskHistory, setTaskHistory] = useState<HistoryEntry[]>([]);

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

  
  useEffect(() => {
    async function loadReferenceData() {
      const [priorityData, statusData, assigneesData] = await Promise.all([
        getPriorities(),
        getStatuses(),
        getUsers(),
      ]);
  
      setPriorities(priorityData);
      setStatuses(statusData);
      setAssignees(assigneesData);
    }
  
    loadReferenceData();
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

  // add task
  const handleAdd = async (
    title: string,
    priorityId: string,
    startDate: string | null,
    dueDate: string | null,
    assignees: string[],
    created_by: number,
  ) => {
    try {
      const task = await addTask({
        title,
        status_id: 1,
        priority_id: Number(priorityId),
        start_date: startDate,
        due_date: dueDate,
        assignee_ids: assignees.map(Number),
        created_by: 1
      });

      const tasks = await getAllTasks();
      setTodos(tasks);
  
      addNotification(
        "Task added",
        `"${title}" has been added to your list.`,
        "indigo"
      );
  
      notifications.show({
        title: "Task added",
        message: `"${title}" has been added to your list.`,
        color: "indigo",
      });
    } catch (error) {
      console.error(error);
  
      notifications.show({
        title: "Error",
        message: "Failed to create task.",
        color: "red",
      });
    }
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

  const handleDelete = async (id: number) => {
    try {
      const todo = todos.find((t) => t.id === id);
      await deleteTask(Number(id));
      setTodos((prev) => prev.filter((t) => t.id !== id));

      if (todo) {
        addNotification("Task deleted", `"${todo.title}" has been permanently removed.`, "red");
        notifications.show({
          title: "Task deleted",
          message: `"${todo.title}" has been permanently removed.`,
          color: "red",
        });
      }
    } catch (error) {
        console.error("Failed to delete task:", error);
      }    
  };

  const handleOpenEdit = (todo: Todo) => {
    setSelectedTodoForEdit(todo);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedFields: Partial<Todo>) => {
    if (!selectedTodoForEdit) return;

    try {
      await updateTask(selectedTodoForEdit.id, {
        title: updatedFields.title || selectedTodoForEdit.title,
        status_id: updatedFields.statusId ?? selectedTodoForEdit.statusId,
        priority_id: updatedFields.priorityId ?? selectedTodoForEdit.priorityId,
        start_date: updatedFields.startDate ?? selectedTodoForEdit.startDate,
        due_date: updatedFields.dueDate ?? selectedTodoForEdit.dueDate,
        assignee_ids: updatedFields.assignees ?? selectedTodoForEdit.assignees,
      });

      const tasks = await getAllTasks();
      setTodos(tasks);
      
      // setTodos((prev) =>
      //   prev.map((t) => {
      //     if (t.id !== selectedTodoForEdit.id) {
      //       return t;
      //     }
          
      //     const history: any[] = [];
  
      //     // Track title changes
      //     if (
      //       updatedFields.title !== undefined &&
      //       updatedFields.title !== t.title
      //     ) {
      //       history.push({
      //         id: crypto.randomUUID(),
      //         timestamp: new Date(),
      //         changeType: "title",
      //         oldValue: t.title,
      //         newValue: updatedFields.title,
      //       });
      //     }
  
      //     // Track status changes
      //     if (
      //       updatedFields.status !== undefined &&
      //       updatedFields.status !== t.status
      //     ) {
      //       history.push({
      //         id: crypto.randomUUID(),
      //         timestamp: new Date(),
      //         changeType: "status",
      //         oldValue: t.status,
      //         newValue: updatedFields.status,
      //       });
      //     }
  
  
      //     // Track priority changes
      //     if (
      //       updatedFields.priority !== undefined &&
      //       updatedFields.priority !== t.priority
      //     ) {
      //       history.push({
      //         id: crypto.randomUUID(),
      //         timestamp: new Date(),
      //         changeType: "priority",
      //         oldValue: t.priority,
      //         newValue: updatedFields.priority,
      //       });
      //     }
  
      //     // Track due date changes
      //     if (
      //       updatedFields.dueDate !== undefined &&
      //       updatedFields.dueDate !== t.dueDate
      //     ) {
      //       history.push({
      //         id: crypto.randomUUID(),
      //         timestamp: new Date(),
      //         changeType: "dueDate",
      //         oldValue: t.dueDate,
      //         newValue: updatedFields.dueDate,
      //       });
      //     }
  
      //     // Track start date changes
      //     if (
      //       updatedFields.startDate !== undefined &&
      //       updatedFields.startDate !== t.startDate
      //     ) {
      //       history.push({
      //         id: crypto.randomUUID(),
      //         timestamp: new Date(),
      //         changeType: "startDate",
      //         oldValue: t.startDate,
      //         newValue: updatedFields.startDate,
      //       });
      //     }
  
          // Track assignee changes
          // if (
          //   updatedFields.assignees &&
          //   JSON.stringify(updatedFields.assignees) !== JSON.stringify(t.assignees)
          // ) {
          //   history.push({
          //     id: crypto.randomUUID(),
          //     timestamp: new Date(),
          //     changeType: "assignees",
          //     oldValue: JSON.stringify(t.assignees),
          //     newValue: JSON.stringify(updatedFields.assignees),
          //   });
          // }
          
        //   return {
        //     ...t,
        //     ...updatedFields,
        //     history: [...t.history, ...history],
        //   };
        // })
      // );
  
      setSelectedTodoForEdit(null);
        
      // addNotification("Task updated", "Task has been updated successfully.", "blue");
      notifications.show({
        title: "Task updated",
        message: "Task has been updated successfully.",
        color: "blue",
      });
  
      setEditModalOpen(false);

    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleOpenHistory = async (todo: Todo) => {
    try{
      setSelectedTodoForHistory(todo);
      setTaskHistory([]);
      setHistoryModalOpen(true);
      
      const records = await getTaskHistory(todo.id);
      const history = mapHistoryToEntries(
        records,
        statuses,
        priorities,
      );
  
      setTaskHistory(history);
    } catch (error) {
      console.error("Failed to fetch task history:", error);
    }    
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
        priorities={priorities}
        statuses={statuses}
        assignees={assignees}
      />
      <TaskHistoryModal
        opened={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        todo={selectedTodoForHistory}
        history={taskHistory}
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
                    priorities={priorities}
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
