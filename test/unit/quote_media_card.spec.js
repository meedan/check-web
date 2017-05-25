import React from 'react';
import Relay from 'react-relay';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import QuoteMediaCard from '../../src/app/components/media/QuoteMediaCard.js';

describe('<QuoteMediaCard />', () => {
  it('renders arabic quotes in RTL form', function() {
    const quote = shallow(<QuoteMediaCard quoteText="الدخول ممنوع" languageCode="ar" />);
    expect(quote.find('.quote-media-card__body-text').hasClass('translation__rtl')).to.equal(true);
    expect(quote.find('.quote-media-card__body-text').hasClass('translation__ltr')).to.equal(false);
  });
  it('renders english quotes in LTR form', function() {
    const quote = shallow(<QuoteMediaCard quoteText="Access Denied" languageCode="en" />);
    expect(quote.find('.quote-media-card__body-text').hasClass('translation__ltr')).to.equal(true);
    expect(quote.find('.quote-media-card__body-text').hasClass('translation__rtl')).to.equal(false);
  });
});
