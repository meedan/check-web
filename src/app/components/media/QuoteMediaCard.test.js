import React from 'react';
import { mount } from 'enzyme';
import QuoteMediaCard from './QuoteMediaCard.js';
import ParsedText from '../ParsedText.js';

describe('<QuoteMediaCard />', () => {
  it('renders arabic quotes in RTL form', () => {
    const quote = mount(<QuoteMediaCard languageCode="ar" quote="الدخول ممنوع" />);
    expect(quote.find('div[lang="ar"][dir="rtl"]')).toHaveLength(1);
  });

  it('renders english quotes in LTR form', () => {
    const quote = mount(<QuoteMediaCard languageCode="en" quote="Access Denied" />);
    expect(quote.find('div[lang="en"][dir="ltr"]')).toHaveLength(1);
  });

  it('renders quotes wrapped in ParsedText', () => {
    const quote = mount(<QuoteMediaCard languageCode="en" quote="Access Denied" />);
    expect(quote.find(ParsedText)).toHaveLength(1);
  });
});
