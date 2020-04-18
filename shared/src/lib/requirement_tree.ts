import {BuildableRequirement} from '@shared/models/buildable';
import {Building} from '@shared/models/building';
import {Technology} from '@shared/models/technology';

interface RequirementTree {
  requirement: BuildableRequirement;
  children: RequirementTree[];
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

export function computeRequirementTree(requirement: BuildableRequirement): RequirementTree {
  const {entity, level} = requirement;
  return {
    requirement,
    children:
      level === 1
        ? entity.requirements.map(r => computeRequirementTree(r))
        : [computeRequirementTree({entity, level: level - 1})],
  };
}

export function getRequirementTreeLeaves(buildTree: RequirementTree): BuildableRequirement[] {
  if (buildTree.children.length === 0) {
    return [buildTree.requirement];
  }
  const leaves = new Map<Building | Technology, number>();
  for (const child of buildTree.children) {
    for (const requirement of getRequirementTreeLeaves(child)) {
      const currentLevel = leaves.get(requirement.entity);
      if (currentLevel !== undefined && currentLevel !== requirement.level) {
        throw new Error(`Incorrect build tree`);
      }
      leaves.set(requirement.entity, requirement.level);
    }
  }
  return Array.from(leaves.entries()).map(([entity, level]) => ({entity, level}));
}

export function removeRequirementFromTree(
  buildTree: RequirementTree,
  requirement: BuildableRequirement
): void {
  buildTree.children = buildTree.children.filter(child => {
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
  buildTree.children.forEach(child => removeRequirementFromTree(child, requirement));
}
