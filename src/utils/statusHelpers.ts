import type { Task, Post } from './storage';

export const TASK_PRIORITY_ORDER: Record<Task['priority'], number> = {
  critical: 0,
  high: 1,
  normal: 2,
};

export const isTaskDone = (task: Task): boolean =>
  task.status === 'deployed' || task.currentStage === 'DEPLOYED';

export const isTaskCancelled = (task: Task): boolean => task.status === 'cancelled';

export const isTaskOpen = (task: Task): boolean => !isTaskDone(task) && !isTaskCancelled(task);

export const isPostPublished = (post: Post): boolean =>
  post.status === 'PUBLISHED' || post.publishedDate != null;

export const isPostOpen = (post: Post): boolean => !isPostPublished(post);

export const taskPriorityRank = (task: Task): number => TASK_PRIORITY_ORDER[task.priority] ?? 2;
