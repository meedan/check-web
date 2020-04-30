import React from 'react';
import { IntlProvider } from 'react-intl';
import QuoteMediaCard from '../../src/app/components/media/QuoteMediaCard.js';
import ParsedText from '../../src/app/components/ParsedText.js';
import { render } from 'enzyme';

describe('<QuoteMediaCard />', () => {
  it('renders arabic quotes in RTL form', () => {
    const quote = render(<IntlProvider locale="en"><QuoteMediaCard quote="الدخول ممنوع" languageCode="ar" /></IntlProvider>);
    expect(quote.html()).toMatch('translation__rtl');
    expect(quote.html()).not.toMatch('translation__ltr');
  });

  it('renders english quotes in LTR form', () => {
    const quote = render(<IntlProvider locale="en"><QuoteMediaCard quote="Access Denied" languageCode="en" /></IntlProvider>);
    expect(quote.html()).toMatch('translation__ltr');
    expect(quote.html()).not.toMatch('translation__rtl');
  });

  it('renders quotes wrapped in ParsedText', () => {
    const quote = render(<IntlProvider locale="en"><QuoteMediaCard quote="Access Denied" languageCode="en" /></IntlProvider>);
    expect(quote.find(ParsedText));
  });
});
