export type HonorScore = number & {_: 'HonorScore'};
export type ResourceAmount = number & {_: 'ResourceAmount'};
export type TechId = number & {_: 'TechId'};

export interface Resources {
  honorScore: HonorScore;
  resources: {
    metal: ResourceInfo;
    crystal: ResourceInfo;
    deuterium: ResourceInfo;
    darkmatter: ResourceInfo;
    energy: ResourceInfo;
  };
  techs: {[techId: number]: TechInfo};
}

export interface ResourceInfo {
  amount: ResourceAmount;
  storage: ResourceAmount;
  baseProduction: ResourceAmount;
}

export interface TechInfo {
  techId: TechId;
  production: ResourcesWithEnergy;
  consumption: ResourcesWithEnergy;
}

export interface ResourcesWithEnergy extends BaseResources {
  energy: ResourceAmount;
}

export interface ResourcesWithEnergyAndSum extends ResourcesWithEnergy {
  sum: ResourceAmount;
}

export interface ResourcesWithSum extends BaseResources {
  sum: ResourceAmount;
}

export interface ResourcesWithSumAndFuel extends ResourcesWithSum {
  fuel: ResourceAmount;
}

export interface ResourcesWithSumAndLargeCargos extends BaseResources {
  sum: ResourceAmount;
  largeCargos: number;
}

export interface BaseResources {
  metal: ResourceAmount;
  crystal: ResourceAmount;
  deuterium: ResourceAmount;
}
