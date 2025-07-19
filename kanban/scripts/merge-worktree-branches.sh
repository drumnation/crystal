#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# List of branches to merge
BRANCHES=(
    "feature/kanban-planning-mode"
    "feature/sample-task-runner"
    "feature/session-bridge"
    "feature/task-loader"
    "feature/validate-kanban-system"
    "test/kanban-ui-tests"
)

echo -e "${BLUE}🔀 Crystal Worktree Branch Merger${NC}"
echo "=================================="

# Ensure we're on main
echo -e "\n${YELLOW}Switching to main branch...${NC}"
git checkout main
git pull

# Show current status
echo -e "\n${YELLOW}Current branch status:${NC}"
for branch in "${BRANCHES[@]}"; do
    commits=$(git rev-list --count main.."$branch" 2>/dev/null || echo "0")
    if [ "$commits" = "0" ]; then
        echo -e "  ${GREEN}✅ $branch (already merged)${NC}"
    else
        echo -e "  ${YELLOW}⚡ $branch ($commits unmerged commits)${NC}"
    fi
done

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "\n${RED}❌ Error: You have uncommitted changes. Please commit or stash them first.${NC}"
    exit 1
fi

# Merge strategy selection
echo -e "\n${BLUE}Choose merge strategy:${NC}"
echo "  1) Regular merge (preserves individual commits)"
echo "  2) Squash merge (one commit per branch)"
echo "  3) Review each branch before merging"
echo "  4) Exit without merging"
read -p "Select [1-4]: " strategy

case $strategy in
    1)
        # Regular merge
        echo -e "\n${GREEN}Starting regular merge of all branches...${NC}"
        for branch in "${BRANCHES[@]}"; do
            commits=$(git rev-list --count main.."$branch" 2>/dev/null || echo "0")
            if [ "$commits" = "0" ]; then
                echo -e "\n${GREEN}✅ $branch is already merged${NC}"
                continue
            fi
            
            echo -e "\n${YELLOW}Merging $branch...${NC}"
            if git merge --no-ff "$branch" -m "Merge branch '$branch' into main

Brings in worktree development from Crystal session"; then
                echo -e "${GREEN}✅ Successfully merged $branch${NC}"
            else
                echo -e "${RED}❌ Merge conflict in $branch!${NC}"
                echo "Resolve conflicts, then run:"
                echo "  git add ."
                echo "  git merge --continue"
                echo "Or abort with: git merge --abort"
                exit 1
            fi
        done
        ;;
        
    2)
        # Squash merge
        echo -e "\n${GREEN}Starting squash merge of all branches...${NC}"
        for branch in "${BRANCHES[@]}"; do
            commits=$(git rev-list --count main.."$branch" 2>/dev/null || echo "0")
            if [ "$commits" = "0" ]; then
                echo -e "\n${GREEN}✅ $branch is already merged${NC}"
                continue
            fi
            
            echo -e "\n${YELLOW}Squash merging $branch...${NC}"
            
            # Get branch description
            case $branch in
                "feature/kanban-planning-mode")
                    desc="Add Kanban planning mode with drag-and-drop task management"
                    ;;
                "feature/sample-task-runner")
                    desc="Implement sample task runner for Claude session launching"
                    ;;
                "feature/session-bridge")
                    desc="Create Crystal-to-Claude session bridge integration"
                    ;;
                "feature/task-loader")
                    desc="Add task loader system for Kanban board"
                    ;;
                "feature/validate-kanban-system")
                    desc="Validate complete Kanban system implementation"
                    ;;
                "test/kanban-ui-tests")
                    desc="Add UI tests for Kanban board functionality"
                    ;;
                *)
                    desc="Merge $branch"
                    ;;
            esac
            
            if git merge --squash "$branch"; then
                git commit -m "$desc

Squashed from worktree branch: $branch
Original commits: $commits"
                echo -e "${GREEN}✅ Successfully squash merged $branch${NC}"
            else
                echo -e "${RED}❌ Merge conflict in $branch!${NC}"
                echo "Resolve conflicts, then run:"
                echo "  git add ."
                echo "  git commit"
                echo "Or abort with: git merge --abort"
                exit 1
            fi
        done
        ;;
        
    3)
        # Interactive review
        echo -e "\n${BLUE}Interactive branch review${NC}"
        for branch in "${BRANCHES[@]}"; do
            commits=$(git rev-list --count main.."$branch" 2>/dev/null || echo "0")
            if [ "$commits" = "0" ]; then
                echo -e "\n${GREEN}✅ $branch is already merged${NC}"
                continue
            fi
            
            echo -e "\n${YELLOW}Branch: $branch${NC}"
            echo "Commits to merge: $commits"
            echo -e "\nRecent commits:"
            git log --oneline -5 main.."$branch"
            
            echo -e "\nOptions:"
            echo "  1) Regular merge"
            echo "  2) Squash merge"
            echo "  3) Skip this branch"
            echo "  4) Exit"
            read -p "Select [1-4]: " choice
            
            case $choice in
                1)
                    if git merge --no-ff "$branch" -m "Merge branch '$branch' into main"; then
                        echo -e "${GREEN}✅ Merged $branch${NC}"
                    else
                        echo -e "${RED}❌ Merge failed! Resolve conflicts or abort.${NC}"
                        exit 1
                    fi
                    ;;
                2)
                    if git merge --squash "$branch"; then
                        read -p "Enter commit message (or press Enter for default): " msg
                        if [ -z "$msg" ]; then
                            msg="Squash merge $branch into main"
                        fi
                        git commit -m "$msg"
                        echo -e "${GREEN}✅ Squash merged $branch${NC}"
                    else
                        echo -e "${RED}❌ Merge failed! Resolve conflicts or abort.${NC}"
                        exit 1
                    fi
                    ;;
                3)
                    echo "Skipping $branch"
                    ;;
                4)
                    echo "Exiting..."
                    exit 0
                    ;;
            esac
        done
        ;;
        
    4)
        echo "Exiting without changes."
        exit 0
        ;;
        
    *)
        echo "Invalid selection."
        exit 1
        ;;
esac

# Summary
echo -e "\n${BLUE}📊 Merge Summary${NC}"
echo "=================="
git log --oneline -10
echo -e "\n${GREEN}✨ All selected merges completed!${NC}"

# Cleanup suggestion
echo -e "\n${YELLOW}💡 Suggested next steps:${NC}"
echo "1. Review the merged changes: git log --graph --oneline -20"
echo "2. Run tests to ensure everything works: pnpm test"
echo "3. Push to remote when ready: git push origin main"
echo "4. Clean up merged worktrees: git worktree prune"

# Optional: Remove merged branches
echo -e "\n${YELLOW}Remove merged local branches?${NC}"
read -p "Delete successfully merged branches? [y/N]: " cleanup
if [[ $cleanup =~ ^[Yy]$ ]]; then
    for branch in "${BRANCHES[@]}"; do
        if git branch --merged | grep -q "$branch"; then
            git branch -d "$branch" && echo -e "${GREEN}✅ Deleted $branch${NC}"
        fi
    done
fi