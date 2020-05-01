import {getDistance, getFlightDuration} from '@shared/lib/formula';
import {getShipDrive} from '@shared/lib/ships';
import {Class} from '@shared/models/account';
import {Bomber, Recycler} from '@shared/models/ships';
import {CombustionDrive, HyperspaceDrive, ImpulseDrive} from '@shared/models/technology';
import {Rosalind} from '@shared/models/universe';

import {Account} from '@src/models/account';
import {DefaultGhosts, SpeedModifier} from '@src/models/ghost';
import {getCoords} from '@src/models/planets';

export function updateGhosts(account: Account): void {
  const combustionLevel = account.accountTechnologies.hasOwnProperty(CombustionDrive.id)
    ? account.accountTechnologies[CombustionDrive.id].value
    : 0;
  const impulseLevel = account.accountTechnologies.hasOwnProperty(ImpulseDrive.id)
    ? account.accountTechnologies[ImpulseDrive.id].value
    : 0;
  const hyperLevel = account.accountTechnologies.hasOwnProperty(HyperspaceDrive.id)
    ? account.accountTechnologies[HyperspaceDrive.id].value
    : 0;
  const recyclerDrive = getShipDrive(
    Recycler,
    Rosalind,
    combustionLevel,
    impulseLevel,
    hyperLevel,
    Class.Collector
  );
  const bomberDrive = getShipDrive(
    Bomber,
    Rosalind,
    combustionLevel,
    impulseLevel,
    hyperLevel,
    Class.Collector
  );
  DefaultGhosts.forEach((destination, source) => {
    const sourcePlanet = account.planetList.find(_ => _.name === source);
    if (sourcePlanet === undefined) {
      return;
    }
    const destinationPlanet = account.planetList.find(_ => _.name === destination);
    if (destinationPlanet === undefined) {
      return;
    }
    const distance = getDistance(
      getCoords(sourcePlanet.coords),
      getCoords(destinationPlanet.coords),
      Rosalind
    );
    account.ghosts[sourcePlanet.id] = {
      destination: destinationPlanet.id,
      distance,
      speeds: [
        {
          name: 'REC 20%',
          techId: Recycler.id,
          timeSeconds: Math.floor(
            getFlightDuration(
              distance,
              recyclerDrive.speed,
              SpeedModifier.TwentyPercent,
              Rosalind
            ) / 1000
          ),
          speedModifier: SpeedModifier.TwentyPercent,
        },
        {
          name: 'BOM 10%',
          techId: Bomber.id,
          timeSeconds: Math.floor(
            getFlightDuration(distance, bomberDrive.speed, SpeedModifier.TenPercent, Rosalind) /
              1000
          ),
          speedModifier: SpeedModifier.TenPercent,
        },
      ],
    };
  });
}
