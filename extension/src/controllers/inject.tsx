import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {App} from '@src/ui/app';

export function injectUI(): void {
  const id = Math.random()
    .toString()
    .substr(2);
  $(`<div id="${id}" style="flex-grow:1;" />`).appendTo(document.body);
  ReactDOM.render(<App />, document.getElementById(id));
}
