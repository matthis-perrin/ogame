import $ from 'jquery';

export function resetUI(): void {
  $('body').css({background: 'black', display: 'flex'});
  $('body > #siteFooter').css({display: 'none'});
  $('body > #chatbarcomponent > #chatBar').css({bottom: '0px'});
  $('#pageContent').css('margin-left', '0');
  $('html > body #planetList > div > a').each((_, element) => {
    $(element).bind('mouseenter', e => e.stopPropagation());
  });
  $('#planetbarcomponent #rechts #myPlanets .smallplanet').css('height', '69px');
  $('#banner_skyscraper').css({display: 'none'});
}
