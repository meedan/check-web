import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import QuoteMediaCard from '../../src/app/components/media/QuoteMediaCard.js';

describe('<QuoteMediaCard />', () => {
  it('renders arabic quotes in RTL form', () => {
    const quote = shallow(<QuoteMediaCard quoteText="الدخول ممنوع" languageCode="ar" />);
    expect(quote.find('.quote__text').hasClass('translation__rtl')).to.equal(true);
    expect(quote.find('.quote__text').hasClass('translation__ltr')).to.equal(false);
  });
  it('renders english quotes in LTR form', () => {
    const quote = shallow(<QuoteMediaCard quoteText="Access Denied" languageCode="en" />);
    expect(quote.find('.quote__text').hasClass('translation__ltr')).to.equal(true);
    expect(quote.find('.quote__text').hasClass('translation__rtl')).to.equal(false);
  });
});
