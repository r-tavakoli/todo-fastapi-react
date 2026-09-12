// "use client";
// import { type TaskPriorityResponse, type TaskStatusResponse, getPriorities, getStatuses } from "@/lib/api";
// import { TEAM_MEMBERS } from "@/lib/team-members";
// import { type TodoStatus, type TodoPriority, STATUS_LABELS } from "@/lib/todo-types";
// import { Modal, Stack, Text, TextInput, Select, MultiSelect, Group, Button } from "@mantine/core";
// import { useState, useEffect } from "react";
// import { EditTaskModalProps } from "./edit-task-modal";


// export function EditTaskModal({
//   opened, onClose, todo, onSave,
// }: EditTaskModalProps) {
//   const [title, setTitle] = useState("");
//   const [status, setStatus] = useState<TodoStatus>("todo");
//   const [priority, setPriority] = useState<TodoPriority>("medium");
//   const [startDate, setStartDate] = useState("");
//   const [dueDate, setDueDate] = useState("");
//   const [assignees, setAssignees] = useState<string[]>([]);
//   const [priorities, setPriorities] = useState<TaskPriorityResponse[]>([]);
//   const [statuses, setStatuses] = useState<TaskStatusResponse[]>([]);

//   useEffect(() => {
//     async function loadPriorities() {
//       try {
//         const data = await getPriorities();
//         setPriorities(data);
//       } catch (error) {
//         console.error("Failed to load priorities:", error);
//       }
//     };
//     loadPriorities();
//   }, []);


//   useEffect(() => {
//     async function loadStatuses() {
//       try {
//         const data = await getStatuses();
//         setStatuses(data);
//       } catch (error) {
//         console.error("Failed to load statuses:", error);
//       }
//     };
//     loadStatuses();
//   }, []);

//     useEffect(() => {
//       if (todo) {
//         setTitle(todo.title);
//         setStatus(todo.status);
//         setPriority(todo.priority);
//         setStartDate(todo.startDate || "");
//         setDueDate(todo.dueDate || "");
//         setAssignees(todo.assignees);
//       }
//     }, [todo, opened]);


//     const handleSave = () => {
//       if (!title.trim()) {
//         return;
//       }

//       const selectedPriority = priorities.find(
//         (p) => p.title.toLowerCase() === priority
//       );

//       if (!selectedPriority) {
//         return;
//       }
      
//       const selectedStatus = statuses.find(
//         (p) => p.title.toLowerCase() === status
//       );

//       if (!selectedStatus) {
//         return;
//       }

//       onSave({
//         title: title.trim(),
//         status,
//         statusId: selectedStatus.id,
//         priority,
//         priorityId: selectedPriority.id,
//         startDate: startDate || null,
//         dueDate: dueDate || null,
//         assignees,
//       });

//       onClose();
//     };

//     if (!todo) return null;

//     return (
//       <Modal
//         opened={opened}
//         onClose={onClose}
//         title={`Edit Task: "${todo.title}"`}
//         size="lg"
//       >
//         <Stack gap="md">
//           <div>
//             <Text size="sm" fw={500} mb="xs">
//               Title
//             </Text>
//             <TextInput
//               value={title}
//               onChange={(e) => setTitle(e.currentTarget.value)}
//               placeholder="Enter task title" />
//           </div>

//           <div>
//             <Text size="sm" fw={500} mb="xs">
//               Status
//             </Text>
//             <Select
//               value={status}
//               onChange={(value) => setStatus(value as TodoStatus)}
//               data={statuses.map((status) => ({
//                 value: status.title.toLowerCase(),
//                 label: status.title,
//               }))} />
//           </div>

//           <div>
//             <Text size="sm" fw={500} mb="xs">
//               Priority
//             </Text>
//             <Select
//               value={priority}
//               onChange={(value) => setPriority(value as TodoPriority)}
//               data={priorities.map((priority) => ({
//                 value: priority.title.toLowerCase(),
//                 label: priority.title,
//               }))} />
//           </div>

//           <div>
//             <Text size="sm" fw={500} mb="xs">
//               Start Date
//             </Text>
//             <TextInput
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.currentTarget.value)} />
//           </div>

//           <div>
//             <Text size="sm" fw={500} mb="xs">
//               Due Date
//             </Text>
//             <TextInput
//               type="date"
//               value={dueDate}
//               onChange={(e) => setDueDate(e.currentTarget.value)} />
//           </div>

//           <div>
//             <Text size="sm" fw={500} mb="xs">
//               Assignees
//             </Text>
//             <MultiSelect
//               value={assignees}
//               onChange={setAssignees}
//               data={TEAM_MEMBERS.map((member) => ({
//                 value: member.id,
//                 label: member.name,
//               }))}
//               placeholder="Select team members"
//               searchable />
//           </div>

//           <Group justify="flex-end" mt="md">
//             <Button variant="light" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave}>Save Changes</Button>
//           </Group>
//         </Stack>
//       </Modal>
//     );
// }
