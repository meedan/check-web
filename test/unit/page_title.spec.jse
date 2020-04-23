import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import config from 'config'; // eslint-disable-line require-path-exists/exists

import PageTitle from '../../src/app/components/PageTitle';

describe('<PageTitle />', () => {
  it('should set the document.title with value in title prop', function() {
    mountWithIntl(<PageTitle title="A Title" />);
    expect(document.title).toEqual('A Title');
  });

  it('should set the document.title based on team name and prefix', function() {
    mountWithIntl(<PageTitle team={{name: 'A Team'}} prefix="A Prefix" />);

    if (config.appName === 'check'){ expect(document.title).toEqual('A Prefix | A Team Check'); }
    if (config.appName === 'bridge'){ expect(document.title).toEqual('A Prefix | A Team Bridge'); }
  });
});
