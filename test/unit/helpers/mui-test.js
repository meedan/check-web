import React from 'react';
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { mount, shallow } from 'enzyme';

const muiTheme = getMuiTheme();

export function mountWithMuiTheme(node) {
  return mount(node, {
    context: { muiTheme },
    childContextTypes: { muiTheme: PropTypes.object },
  });
}

export function shallowWithMuiTheme(node) {
  return shallow(node, { context: { muiTheme } });
}
