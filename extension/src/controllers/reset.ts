import $ from 'jquery';

export function resetUI(): void {
  $('body').css({background: 'black', display: 'flex'});
  $('#pageContent').css('margin-left', '0');
  $('html > body > #pageContent > #right #planetList > div > a').each((_, element) => {
    $(element).bind('mouseenter', e => e.stopPropagation());
  });
  $('#planetbarcomponent #rechts #myPlanets .smallplanet').css('height', '59px');
}
