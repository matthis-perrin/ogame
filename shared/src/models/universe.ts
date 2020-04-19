export interface Universe {
  flightSpeed: number;
  economySpeed: number;
  researchSpeed: number;
  planetSizeBonus: number;
  numberOfGalaxy: number;
  numberOfSystem: number;
  shipInDebrisFieldRatio: number;
  defenseInDebrisFieldRatio: number;
  circularGalaxy: boolean;
  circularSystem: boolean;
  deuteriumConsumptionFactor: number;
}

export const Rosalind: Universe = {
  flightSpeed: 6,
  economySpeed: 6,
  researchSpeed: 12,
  planetSizeBonus: 25,
  numberOfGalaxy: 5,
  numberOfSystem: 499,
  shipInDebrisFieldRatio: 0.3,
  defenseInDebrisFieldRatio: 0,
  circularGalaxy: true,
  circularSystem: true,
  deuteriumConsumptionFactor: 0.8,
};
