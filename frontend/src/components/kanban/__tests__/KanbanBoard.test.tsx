import React from 'react';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '../KanbanBoard';

// Mock the API module
jest.mock('../../../utils/api', () => ({
  API: {
    projects: {
      getActive: jest.fn(() => Promise.resolve({
        success: true,
        data: { id: 1, name: 'Test Project' }
      }))
    }
  }
}));

// Mock the task loader
jest.mock('../../../../kanban/logic/taskLoader', () => ({
  loadTasks: jest.fn(() => Promise.resolve({
    success: true,
    tasks: [],
    errors: []
  }))
}));

describe('KanbanBoard Worktree Columns', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should render worktree columns instead of status columns', async () => {
    render(<KanbanBoard />);
    
    // Wait for the board to load
    await screen.findByText(/Project:/);
    
    // Should NOT show old status-based columns
    expect(screen.queryByText('Planned')).not.toBeInTheDocument();
    expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    
    // Should show worktree-based columns (from mock data)
    expect(screen.getByText('task-visualization-overhaul')).toBeInTheDocument();
    expect(screen.getByText('claude-prompt-strategy')).toBeInTheDocument();
    expect(screen.getByText('Main Branch')).toBeInTheDocument();
  });

  test('should highlight current worktree column', async () => {
    render(<KanbanBoard />);
    
    // Wait for the board to load
    await screen.findByText(/Project:/);
    
    // Current worktree should have "current" badge
    expect(screen.getByText('current')).toBeInTheDocument();
    
    // Should be associated with the current worktree
    const currentWorktreeHeader = screen.getByText('task-visualization-overhaul');
    expect(currentWorktreeHeader).toBeInTheDocument();
  });

  test('should display task count summaries', async () => {
    render(<KanbanBoard />);
    
    // Wait for the board to load
    await screen.findByText(/Project:/);
    
    // Should show task counts in the project header
    expect(screen.getByText(/Tasks: \d+/)).toBeInTheDocument();
    expect(screen.getByText(/Worktrees: \d+/)).toBeInTheDocument();
    
    // Should show per-column task counts
    expect(screen.getByText(/\d+ active/)).toBeInTheDocument();
    expect(screen.getByText(/\d+ queued/)).toBeInTheDocument();
    expect(screen.getByText(/\d+ done/)).toBeInTheDocument();
  });

  test('should organize tasks by execution status within columns', async () => {
    render(<KanbanBoard />);
    
    // Wait for the board to load
    await screen.findByText(/Project:/);
    
    // Should show section headers within columns
    expect(screen.getByText('🔄 Active')).toBeInTheDocument();
    expect(screen.getByText('📋 Queued')).toBeInTheDocument();
    expect(screen.getByText('✅ Completed')).toBeInTheDocument();
  });

  test('should display git branch icons', async () => {
    render(<KanbanBoard />);
    
    // Wait for the board to load
    await screen.findByText(/Project:/);
    
    // Should have git branch icons (Lucide icons render as SVG)
    const branchIcons = document.querySelectorAll('[data-lucide="git-branch"]');
    expect(branchIcons.length).toBeGreaterThan(0);
  });

  test('should show mock task data', async () => {
    render(<KanbanBoard />);
    
    // Wait for the board to load and tasks to appear
    await screen.findByText('Implement Worktree-Based Columns');
    
    // Should show the mock tasks we created
    expect(screen.getByText('Implement Worktree-Based Columns')).toBeInTheDocument();
    expect(screen.getByText('Generate Claude Prompts from Tasks')).toBeInTheDocument();
    expect(screen.getByText('Kanban UI Automated Tests')).toBeInTheDocument();
    expect(screen.getByText('Merge All Feature Branches')).toBeInTheDocument();
  });

  test('should group tasks by branch assignment', async () => {
    render(<KanbanBoard />);
    
    // Wait for the board to load
    await screen.findByText(/Project:/);
    
    // Tasks should be grouped under their respective worktree columns
    // Current worktree should have multiple tasks
    const currentWorktreeSection = screen.getByText('task-visualization-overhaul').closest('.bg-gray-50');
    expect(currentWorktreeSection).toBeInTheDocument();
    
    // Other branches should exist
    expect(screen.getByText('claude-prompt-strategy')).toBeInTheDocument();
    expect(screen.getByText('env-orchestration')).toBeInTheDocument();
  });
});