import React from 'react';
import { shallow } from 'enzyme';
import NewsletterStatic from './NewsletterStatic';

describe('<NewsletterStatic />', () => {
  it('renders static newsletter component', () => {
    const newsletterStatic = shallow(<NewsletterStatic
      numberOfArticles={1}
      onUpdateNumberOfArticles={() => {}}
      articles={['first', 'second', 'third']}
      onUpdateArticles={() => {}}
      setTextfieldOverLength={() => {}}
    />);
    expect(newsletterStatic.find('.newsletter-static')).toHaveLength(1);
    expect(newsletterStatic.find('.newsletter-article')).toHaveLength(1);
  });

  it('renders static newsletter component with multiple articles', () => {
    const newsletterStatic = shallow(<NewsletterStatic
      numberOfArticles={3}
      onUpdateNumberOfArticles={() => {}}
      articles={['first', 'second', 'third']}
      onUpdateArticles={() => {}}
      setTextfieldOverLength={() => {}}
    />);
    expect(newsletterStatic.find('.newsletter-static')).toHaveLength(1);
    expect(newsletterStatic.find('.newsletter-article')).toHaveLength(3);
  });
});
