import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { mount, shallow } from 'enzyme';

const muiTheme = getMuiTheme();

export function mountWithMuiTheme(node) {
  return mount(node, {
    context: { muiTheme },
    childContextTypes: { muiTheme: React.PropTypes.object },
  });
}

export function shallowWithMuiTheme(node) {
  return shallow(node, { context: { muiTheme } });
}
