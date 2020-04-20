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
  production: ResourceValues;
  consumption: ResourceValues;
}

export interface ResourceValues {
  metal: ResourceAmount;
  crystal: ResourceAmount;
  deuterium: ResourceAmount;
  energy: ResourceAmount;
}
