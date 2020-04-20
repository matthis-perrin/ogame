import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {SESSION_ID} from '@src/models/constants';
import {App} from '@src/ui/app';

export function injectUI(): void {
  $(`<div id="${SESSION_ID}" style="flex-grow:1;" />`).appendTo(document.body);
  ReactDOM.render(<App />, document.getElementById(SESSION_ID));
}
