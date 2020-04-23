import $ from 'jquery';

const resourcesRegex = /metal=(\d+)&crystal=(\d+)&deuterium=(\d+)/;
const resourcesRefresh = 500;

export function resetUI(): void {
  $('body').css({background: 'black', display: 'flex'});
  $('body > #chatbarcomponent > #chatBar').css({bottom: '0px'});
  $('#pageContent,body > .contentBoxBody').css({marginLeft: '0px', top: '0px'});
  $('html > body #planetList > div > a').each((_, element) => {
    $(element).bind('mouseenter', e => e.stopPropagation());
  });
  $('#planetbarcomponent #rechts #myPlanets .smallplanet').css('height', '69px');
  $('#siteHeader,#mmonetbar,#banner_skyscraper,#siteFooter').css({display: 'none'});
  if (document.location.search.includes('component=fleetdispatch')) {
    $('input[name=transporterLarge]').focus();
    const match = resourcesRegex.exec(document.location.search);
    // eslint-disable-next-line no-null/no-null
    if (match !== null) {
      const interval = setInterval(() => {
        const element = $('#sendFleet:visible');
        if (element.length > 0) {
          clearInterval(interval);
          $('input[name=metal]').val(match[1]);
          $('input[name=crystal]').val(match[2]);
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          $('input[name=deuterium]').val(match[3]);
        }
      }, resourcesRefresh);
    }
  }
}
