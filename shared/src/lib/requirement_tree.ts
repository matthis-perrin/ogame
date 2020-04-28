import {buildableRequirementToString} from '@shared/lib/build_items';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {Buildable, BuildableRequirement} from '@shared/models/buildable';
import {Building} from '@shared/models/building';
import {Technology} from '@shared/models/technology';
import {Milliseconds, NEVER, ZERO} from '@shared/models/time';
import {neverHappens} from '@shared/utils/type_utils';

export interface RequirementTree {
  target: Buildable;
  children: RequirementTreeNode[];
}

interface RequirementTreeNode {
  requirement: BuildableRequirement;
  children: RequirementTreeNode[];
}

export function buildableRequirementAreEqual(
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
    if (buildableRequirementAreEqual(child.requirement, requirement)) {
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

export function canBeNextBuildItemAppliedOnAccount(
  account: Account,
  buildItem: BuildItem
): boolean {
  if (buildItem.type === 'technology') {
    const technoLevel = account.technologyLevels.get(buildItem.buildable) ?? 0;
    const inProgressTechnoLevel =
      account.inProgressTechnology &&
      account.inProgressTechnology.technology === buildItem.buildable
        ? account.inProgressTechnology.level
        : 0;

    // For techno with level > 1, all we need is the previous level done (or in progress)
    if (buildItem.level > 1) {
      return technoLevel >= buildItem.level - 1 || inProgressTechnoLevel >= buildItem.level - 1;
    }
  }

  const planet = account.planets.get(buildItem.planetId);
  if (!planet) {
    throw new Error(`No planet with id ${buildItem.planetId} on the account`);
  }

  if (buildItem.type === 'building') {
    const buildingLevel = planet.buildingLevels.get(buildItem.buildable) ?? 0;
    const inProgressBuildingLevel =
      planet.inProgressBuilding && planet.inProgressBuilding.building === buildItem.buildable
        ? planet.inProgressBuilding.level
        : 0;

    // For building with level > 1, all we need is the previous level done (or in progress)
    if (buildItem.level > 1) {
      return buildingLevel >= buildItem.level - 1 || inProgressBuildingLevel >= buildItem.level - 1;
    }
  }

  // Basic check done, we not verify the buildable requirements
  for (const requirement of buildItem.buildable.requirements) {
    if (requirement.entity.type === 'building') {
      if ((planet.buildingLevels.get(requirement.entity) ?? 0) < requirement.level) {
        if (
          !planet.inProgressBuilding ||
          planet.inProgressBuilding.building !== requirement.entity ||
          planet.inProgressBuilding.level < requirement.level
        ) {
          if (buildItem.type === 'ship') {
            // eslint-disable-next-line no-debugger
            debugger;
          }
          return false;
        }
      }
    } else if (requirement.entity.type === 'technology') {
      if ((account.technologyLevels.get(requirement.entity) ?? 0) < requirement.level) {
        if (
          !account.inProgressTechnology ||
          account.inProgressTechnology.technology !== requirement.entity ||
          account.inProgressTechnology.level < requirement.level
        ) {
          if (buildItem.type === 'ship') {
            // eslint-disable-next-line no-debugger
            debugger;
          }
          return false;
        }
      }
    } else {
      neverHappens(requirement.entity, `Invalid requirement type "${requirement.entity['type']}"`);
    }
  }
  return true;
}

export function isBuildItemAvailable(
  account: Account,
  buildItem: BuildItem
): {isAvailable: boolean; reason: string; willBeAvailableAt: Milliseconds} {
  let isAvailable = true;
  let willBeAvailableAt: Milliseconds = ZERO;
  let reason = '';

  const requirementsWithPreviousLevelConstraint: BuildableRequirement[] = [
    ...buildItem.buildable.requirements,
  ];
  if (buildItem.type === 'building' || buildItem.type === 'technology') {
    if (buildItem.level > 1) {
      requirementsWithPreviousLevelConstraint.push({
        entity: buildItem.buildable,
        level: buildItem.level - 1,
      });
    }
  }

  for (const requirement of requirementsWithPreviousLevelConstraint) {
    const planet = account.planets.get(buildItem.planetId);
    if (!planet) {
      throw new Error(`No planet with id ${buildItem.planetId} on the account`);
    }
    if (requirement.entity.type === 'building') {
      if ((planet.buildingLevels.get(requirement.entity) ?? 0) < requirement.level) {
        if (
          planet.inProgressBuilding &&
          planet.inProgressBuilding.building === requirement.entity &&
          planet.inProgressBuilding.level >= requirement.level
        ) {
          isAvailable = false;
          if (willBeAvailableAt < planet.inProgressBuilding.endTime) {
            willBeAvailableAt = planet.inProgressBuilding.endTime;
            reason = `${buildableRequirementToString(requirement)} in progress`;
          }
        } else {
          isAvailable = false;
          willBeAvailableAt = NEVER;
          reason = `${buildableRequirementToString(requirement)} required`;
        }
      }
    } else if (requirement.entity.type === 'technology') {
      if ((account.technologyLevels.get(requirement.entity) ?? 0) < requirement.level) {
        if (
          account.inProgressTechnology &&
          account.inProgressTechnology.technology === requirement.entity &&
          account.inProgressTechnology.level >= requirement.level
        ) {
          isAvailable = false;
          if (willBeAvailableAt < account.inProgressTechnology.endTime) {
            willBeAvailableAt = account.inProgressTechnology.endTime;
            reason = `${buildableRequirementToString(requirement)} in progress`;
          }
        } else {
          isAvailable = false;
          willBeAvailableAt = NEVER;
          reason = `${buildableRequirementToString(requirement)} required`;
        }
      }
    } else {
      neverHappens(requirement.entity, `Invalid requirement type "${requirement.entity['type']}"`);
    }
  }
  return {isAvailable, willBeAvailableAt, reason};
}

export function flattenedRequirements(buildable: Buildable): BuildableRequirement[] {
  const requirementMap = new Map<Technology | Building, number>();
  for (const requirement of buildable.requirements) {
    requirementMap.set(
      requirement.entity,
      Math.max(requirementMap.get(requirement.entity) ?? 0, requirement.level)
    );
    for (const subRequirements of flattenedRequirements(requirement.entity)) {
      requirementMap.set(
        subRequirements.entity,
        Math.max(requirementMap.get(subRequirements.entity) ?? 0, subRequirements.level)
      );
    }
  }
  return Array.from(requirementMap.entries()).map(([entity, level]) => ({entity, level}));
}
