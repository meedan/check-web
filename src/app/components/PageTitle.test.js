import React from 'react';
import { Helmet } from 'react-helmet';
import config from 'config';
import PageTitle from './PageTitle';
import { mountWithIntlProvider } from '../../../test/unit/helpers/intl-test';


jest.mock('config');

describe('<PageTitle />', () => {
  it('should set the document.title with value in title prop', () => {
    mountWithIntlProvider(<PageTitle title="A Title" />);
    expect(Helmet.peek().title).toEqual('A Title');
  });

  it('should set document.title when config.appName === "check"', () => {
    config.appName = 'check';
    mountWithIntlProvider(<PageTitle prefix="A Prefix" team={{ name: 'A Team' }} />);
    expect(Helmet.peek().title).toEqual('A Prefix | A Team Check');
  });

  it('should set document.title when config.appName === "bridge"', () => {
    config.appName = 'bridge';
    // FIXME don't use i18n to change the brand name. Use a variable.
    mountWithIntlProvider(
      <PageTitle prefix="A Prefix" team={{ name: 'A Team' }} />,
      {
        messages: { 'global.appNameHuman': 'Bridge' },
      },
    );
    expect(Helmet.peek().title).toEqual('A Prefix | A Team Bridge');
  });

  it('should ASCII-emojify the title', () => {
    mountWithIntlProvider(<PageTitle title="A :smile: goes a long way :rocket:" />);
    expect(Helmet.peek().title).toEqual('A 😄 goes a long way 🚀');
  });

  it('should render "Check" when title=null prefix=null', () => {
    mountWithIntlProvider(<PageTitle />);
    expect(Helmet.peek().title).toEqual('Check');
  });
});
