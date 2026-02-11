// Task types for TaskFlow application

export type TaskCategory = 'work' | 'personal' | 'study' | 'project' | 'other';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  deadline?: number; // Unix timestamp
  notificationIds?: string[]; // Array of scheduled notification IDs
}

export interface TaskContextType {
  tasks: Task[];
  pendingTasks: Task[];
  completedTasks: Task[];
  addTask: (title: string, description?: string, category?: TaskCategory, deadline?: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearCompleted: () => void;
  isLoading: boolean;
}
