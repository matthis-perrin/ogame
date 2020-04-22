import $ from 'jquery';

export function resetUI(): void {
  $('body').css({background: 'black', display: 'flex'});
  $('body > #chatbarcomponent > #chatBar').css({bottom: '0px'});
  $('#pageContent,body > .contentBoxBody').css({marginLeft: '0px', top: '0px'});
  $('html > body #planetList > div > a').each((_, element) => {
    $(element).bind('mouseenter', e => e.stopPropagation());
  });
  $('#planetbarcomponent #rechts #myPlanets .smallplanet').css('height', '69px');
  $('#siteHeader,#mmonetbar,#banner_skyscraper,#siteFooter').css({display: 'none'});
}
