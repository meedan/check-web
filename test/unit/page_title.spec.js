/* globals describe, expect, it, jest */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Helmet } from 'react-helmet';
import config from 'config';
import { mountWithIntlProvider } from './helpers/intl-test';

import PageTitle from '../../src/app/components/PageTitle';

jest.mock('config');

describe('<PageTitle />', () => {
  it('should set the document.title with value in title prop', () => {
    mountWithIntlProvider(<PageTitle title="A Title" />);
    expect(Helmet.peek().title).toEqual('A Title');
  });

  it('should set document.title when config.appName === "check"', () => {
    config.appName = 'check';
    mountWithIntlProvider(<PageTitle team={{ name: 'A Team' }} prefix="A Prefix" />);
    expect(Helmet.peek().title).toEqual('A Prefix | A Team Check');
  });

  it('should set document.title when config.appName === "bridge"', () => {
    config.appName = 'bridge';
    // FIXME don't use i18n to change the brand name. Use a variable.
    mountWithIntlProvider(
      <PageTitle team={{ name: 'A Team' }} prefix="A Prefix" />,
      {
        messages: { 'global.appNameHuman': 'Bridge' },
      },
    );
    expect(Helmet.peek().title).toEqual('A Prefix | A Team Bridge');
  });

  it('should skip team when prefix is provided but no team is', () => {
    mountWithIntlProvider(<PageTitle
      prefix={<FormattedMessage id="test.PageTitleTest" defaultMessage="Translated!" />}
    />);
    expect(Helmet.peek().title).toEqual('Translated! | Check');
  });

  it('should translate when prefix is a <FormattedMessage>', () => {
    config.appName = 'check';
    mountWithIntlProvider(<PageTitle
      team={{ name: 'Test' }}
      prefix={<FormattedMessage id="test.PageTitleTest" defaultMessage="Translated!" />}
    />);
    expect(Helmet.peek().title).toEqual('Translated! | Test Check');
  });

  it('should ASCII-emojify the title', () => {
    mountWithIntlProvider(<PageTitle title="A :smile: goes a long way :rocket:" />);
    expect(Helmet.peek().title).toEqual('A 😄 goes a long way 🚀');
  });

  it('should translate when title is a <FormattedMessage>', () => {
    mountWithIntlProvider(<PageTitle
      title={<FormattedMessage id="test.PageTitleTest" defaultMessage="Translated!" />}
    />);
    expect(Helmet.peek().title).toEqual('Translated!');
  });

  it('should render "Check" when title=null prefix=null', () => {
    mountWithIntlProvider(<PageTitle />);
    expect(Helmet.peek().title).toEqual('Check');
  });
});
