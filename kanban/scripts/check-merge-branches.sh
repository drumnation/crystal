#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Checking branch merge status..."
echo "================================"

# Get all local branches except main
branches=$(git branch | grep -v "^\* " | grep -v "main" | sed 's/^[[:space:]]*//')

# Arrays to store branch status
merged_branches=()
unmerged_branches=()

# Check each branch
while IFS= read -r branch; do
    if [ -n "$branch" ]; then
        # Check if branch is merged into main
        if git merge-base --is-ancestor "$branch" main 2>/dev/null; then
            merged_branches+=("$branch")
        else
            unmerged_branches+=("$branch")
        fi
    fi
done <<< "$branches"

# Display results
echo -e "\n${GREEN}✅ Merged into main:${NC}"
if [ ${#merged_branches[@]} -eq 0 ]; then
    echo "   (none)"
else
    for branch in "${merged_branches[@]}"; do
        echo "   - $branch"
    done
fi

echo -e "\n${YELLOW}❌ Not merged into main:${NC}"
if [ ${#unmerged_branches[@]} -eq 0 ]; then
    echo "   (none)"
else
    for branch in "${unmerged_branches[@]}"; do
        echo "   - $branch"
        # Show commit difference
        ahead=$(git rev-list --count main.."$branch" 2>/dev/null || echo "?")
        behind=$(git rev-list --count "$branch"..main 2>/dev/null || echo "?")
        echo "     (ahead: $ahead, behind: $behind)"
    done
fi

# Offer to merge if there are unmerged branches
if [ ${#unmerged_branches[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}Would you like to merge these branches into main?${NC}"
    echo "Options:"
    echo "  1) Merge all branches"
    echo "  2) Select branches to merge"
    echo "  3) Exit without merging"
    read -p "Choose [1-3]: " choice

    case $choice in
        1)
            echo -e "\n${GREEN}Merging all branches...${NC}"
            for branch in "${unmerged_branches[@]}"; do
                echo -e "\nMerging $branch..."
                if git merge "$branch" --no-ff -m "Merge branch '$branch' into main"; then
                    echo -e "${GREEN}✅ Successfully merged $branch${NC}"
                else
                    echo -e "${RED}❌ Failed to merge $branch (conflicts may need resolution)${NC}"
                    echo "Resolve conflicts and run 'git merge --continue' or 'git merge --abort'"
                    exit 1
                fi
            done
            ;;
        2)
            echo -e "\n${YELLOW}Select branches to merge:${NC}"
            selected_branches=()
            for i in "${!unmerged_branches[@]}"; do
                read -p "Merge ${unmerged_branches[$i]}? [y/N]: " yn
                case $yn in
                    [Yy]* ) selected_branches+=("${unmerged_branches[$i]}");;
                esac
            done
            
            if [ ${#selected_branches[@]} -gt 0 ]; then
                echo -e "\n${GREEN}Merging selected branches...${NC}"
                for branch in "${selected_branches[@]}"; do
                    echo -e "\nMerging $branch..."
                    if git merge "$branch" --no-ff -m "Merge branch '$branch' into main"; then
                        echo -e "${GREEN}✅ Successfully merged $branch${NC}"
                    else
                        echo -e "${RED}❌ Failed to merge $branch (conflicts may need resolution)${NC}"
                        echo "Resolve conflicts and run 'git merge --continue' or 'git merge --abort'"
                        exit 1
                    fi
                done
            else
                echo "No branches selected for merging."
            fi
            ;;
        3)
            echo "Exiting without merging."
            ;;
        *)
            echo "Invalid choice. Exiting."
            ;;
    esac
fi

echo -e "\n✨ Done!"