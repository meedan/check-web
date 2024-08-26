import React from 'react';
import { shallow } from 'enzyme';
import NewsletterStatic from './NewsletterStatic';

describe('<NewsletterStatic />', () => {
  it('renders static newsletter component', () => {
    const newsletterStatic = shallow(<NewsletterStatic
      articles={['first', 'second', 'third']}
      numberOfArticles={1}
      setTextfieldOverLength={() => {}}
      onUpdateArticles={() => {}}
      onUpdateNumberOfArticles={() => {}}
    />);
    expect(newsletterStatic.find('.newsletter-static')).toHaveLength(1);
    expect(newsletterStatic.find('.newsletter-article')).toHaveLength(1);
  });

  it('renders static newsletter component with multiple articles', () => {
    const newsletterStatic = shallow(<NewsletterStatic
      articles={['first', 'second', 'third']}
      numberOfArticles={3}
      setTextfieldOverLength={() => {}}
      onUpdateArticles={() => {}}
      onUpdateNumberOfArticles={() => {}}
    />);
    expect(newsletterStatic.find('.newsletter-static')).toHaveLength(1);
    expect(newsletterStatic.find('.newsletter-article')).toHaveLength(3);
  });
});
