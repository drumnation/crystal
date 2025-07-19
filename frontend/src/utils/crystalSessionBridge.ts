import { API } from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Crystal Session Bridge
 * 
 * This module provides functionality to launch Claude Code sessions 
 * directly from task cards in the Kanban interface.
 */
export class CrystalSessionBridge {
  /**
   * Launch a Claude Code session for the given task
   * @param task The task to create a session for
   */
  static async launchClaudeSession(task: Task): Promise<void> {
    console.log('🚀 Launching Claude session for task:', task.title);
    
    try {
      // Get the active project first
      const activeProjectResponse = await API.projects.getActive();
      
      if (!activeProjectResponse.success || !activeProjectResponse.data) {
        console.error('❌ No active project found');
        // Show toast notification (placeholder for now)
        this.showNotification('No active project', 'Please select a project before launching Claude sessions', 'error');
        return;
      }

      // Generate a prompt based on the task
      const prompt = this.generatePromptFromTask(task);
      
      // For now, just log the generated prompt and show a toast
      console.log('📝 Generated prompt:', prompt);
      
      // Generate branch name for the task
      const branchName = `feature/task-${task.id}-${task.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      console.log('🌳 Suggested branch name:', branchName);
      
      // TODO: Implement actual session creation once the integration is complete
      // const sessionResponse = await API.sessions.create({
      //   projectId: activeProject.id,
      //   prompt: prompt,
      //   // Add other session creation parameters as needed
      // });
      
      // Show success notification
      this.showNotification(
        'Claude Session Ready', 
        `Session for "${task.title}" would be launched with prompt:\n\n${prompt}`,
        'success'
      );
      
    } catch (error) {
      console.error('❌ Failed to launch Claude session:', error);
      this.showNotification('Launch Failed', `Failed to launch Claude session: ${error}`, 'error');
    }
  }
  
  /**
   * Generate a Claude prompt based on the task details
   * @param task The task to generate a prompt for
   * @returns A formatted prompt string
   */
  private static generatePromptFromTask(task: Task): string {
    let prompt = `Task: ${task.title}`;
    
    if (task.description) {
      prompt += `\n\nDescription: ${task.description}`;
    }
    
    if (task.priority) {
      prompt += `\n\nPriority: ${task.priority}`;
    }
    
    prompt += `\n\nPlease help me implement this task. Analyze the current codebase and suggest the best approach to complete this task.`;
    
    return prompt;
  }
  
  /**
   * Show a notification to the user
   * TODO: Replace with actual toast notification system
   * @param title Notification title
   * @param message Notification message
   * @param type Notification type
   */
  private static showNotification(title: string, message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // For now, just use console and alert
    console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    
    // Simple alert for demonstration - replace with proper toast in production
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    alert(`${icon} ${title}\n\n${message}`);
  }
}

export default CrystalSessionBridge;