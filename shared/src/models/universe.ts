export interface Universe {
  readonly flightSpeed: number;
  readonly economySpeed: number;
  readonly researchSpeed: number;
  readonly planetSizeBonus: number;
  readonly numberOfGalaxy: number;
  readonly numberOfSystem: number;
  readonly shipInDebrisFieldRatio: number;
  readonly defenseInDebrisFieldRatio: number;
  readonly circularGalaxy: boolean;
  readonly circularSystem: boolean;
  readonly deuteriumConsumptionFactor: number;
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
