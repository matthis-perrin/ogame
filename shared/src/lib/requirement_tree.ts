import {Buildable, BuildableRequirement} from '@shared/models/buildable';
import {Building} from '@shared/models/building';
import {Technology} from '@shared/models/technology';

interface RequirementTree {
  target: Buildable;
  children: RequirementTreeNode[];
}

interface RequirementTreeNode {
  requirement: BuildableRequirement;
  children: RequirementTreeNode[];
}

function requirementsAreEqual(
  requirement1: BuildableRequirement,
  requirement2: BuildableRequirement
): boolean {
  return (
    requirement1.entity.name === requirement2.entity.name &&
    requirement1.level === requirement2.level
  );
}

export function requirementToDebugString(requirement: BuildableRequirement): string {
  return `${requirement.entity.name} lvl ${requirement.level}`;
}

function computeRequirementTreeNode(requirement: BuildableRequirement): RequirementTreeNode {
  const {entity, level} = requirement;
  return {
    requirement,
    children:
      level === 1
        ? entity.requirements.map(r => computeRequirementTreeNode(r))
        : [computeRequirementTreeNode({entity, level: level - 1})],
  };
}

export function computeRequirementTree(target: Buildable): RequirementTree {
  return {
    target,
    children: target.requirements.map(computeRequirementTreeNode),
  };
}

interface AnyNode {
  requirement?: BuildableRequirement;
  children: RequirementTreeNode[];
}

function getLeaves<Node extends AnyNode>(node: Node): BuildableRequirement[] {
  if (node.children.length === 0 && node.requirement) {
    return [node.requirement];
  }
  const leaves = new Map<Building | Technology, number>();
  for (const child of node.children) {
    for (const requirement of getLeaves(child)) {
      const currentLevel = leaves.get(requirement.entity);
      if (currentLevel !== undefined && currentLevel !== requirement.level) {
        throw new Error(`Incorrect build tree`);
      }
      leaves.set(requirement.entity, requirement.level);
    }
  }
  return Array.from(leaves.entries()).map(([entity, level]) => ({entity, level}));
}

export function getRequirementTreeLeaves(buildTree: RequirementTree): BuildableRequirement[] {
  return getLeaves(buildTree);
}

function removeRequirementFromTreeNode<Node extends {children: RequirementTreeNode[]}>(
  node: Node,
  requirement: BuildableRequirement
): void {
  node.children = node.children.filter(child => {
    if (requirementsAreEqual(child.requirement, requirement)) {
      if (child.children.length > 0) {
        throw new Error(
          `Can not remove requirement "${requirementToDebugString(
            requirement
          )}" from tree. Not a leaf.`
        );
      }
      return false;
    }
    return true;
  });
  node.children.forEach(child => removeRequirementFromTreeNode(child, requirement));
}

export function removeRequirementFromTree(
  buildTree: RequirementTree,
  requirement: BuildableRequirement
): void {
  removeRequirementFromTreeNode(buildTree, requirement);
}
