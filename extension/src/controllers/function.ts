import {PROBES_AMOUNT} from '@src/models/constants';
import {getCoords, PlanetCoords} from '@src/models/planets';

function runScript(scriptStr: string): void {
  const script = document.createElement('script');
  script.textContent = scriptStr;
  document.head.appendChild(script);
  script.remove();
}

export function sendProbes(planetCoords: PlanetCoords): void {
  const coords = getCoords(planetCoords);
  runScript(
    `sendShipsWithPopup(6,${coords.galaxy},${coords.system},${coords.position},1,${PROBES_AMOUNT})`
  );
}

export function deleteMessage(messageId: string): void {
  runScript(
    `$.ajax({type:"POST",url:"?page=messages",dataType:"json",data:{messageId:${messageId},action:103,ajax:1,},success:function(){},error:function(){},})`
  );
}
