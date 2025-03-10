import React from 'react';
import { ArticlesComponent, adjustFilters } from './Articles';
import { shallowWithIntl, mockIntl } from '../../../../test/unit/helpers/intl-test';

describe('<Articles />', () => {
  const article = {
    title: 'Title',
    url: 'https://test.xyz',
    language: 'en',
    updated_at: '1716862848',
    tags: ['foo', 'bar'],
  };

  const articlesProps = {
    title: <span>Title</span>,
    icon: <div />,
    team: { slug: 'test', name: 'Test' },
    onChangeSearchParams: () => {},
  };

  it('should render explainers as cards', () => {
    const explainers = [
      {
        ...article,
        id: 'RXhwbGFpbmVyLzEK',
        dbid: 1,
        description: 'Description 1',
        nodeType: 'Explainer',
      },
      {
        ...article,
        id: 'RXhwbGFpbmVyLzIK',
        dbid: 2,
        description: 'Description 2',
        nodeType: 'Explainer',
      },
    ];
    const wrapper = shallowWithIntl(<ArticlesComponent {...articlesProps} articles={explainers} intl={mockIntl} type="explainer" />);
    expect(wrapper.find('ArticleCard')).toHaveLength(2);
  });

  // Prevents regression: CV2-5988
  it('adjustFilters should add articles API filters keys as aliases keeping original UI filters keys', () => {
    const filters = adjustFilters({ verification_status: 'false' });
    expect(filters).toEqual({ rating: 'false', verification_status: 'false' });
  });

  // Prevents regression: CV2-5988
  it('adjustFilters should not insert API filters keys with undefined values unnecessarily', () => {
    const filters = adjustFilters({});
    expect(filters).toEqual({});
  });

  it('should render all articles', () => {
    const explainers = [
      {
        ...article,
        id: 'RXhwbGFpbmVyLzEK',
        dbid: 1,
        description: 'Description',
        nodeType: 'Explainer',
      },
      {
        ...article,
        id: 'RmFjdENoZWNrLzEK',
        dbid: 1,
        summary: 'Summary',
        nodeType: 'FactCheck',
      },
    ];
    const wrapper = shallowWithIntl(<ArticlesComponent {...articlesProps} articles={explainers} intl={mockIntl} type={null} />);
    expect(wrapper.find('ArticleCard')).toHaveLength(2);
  });
});
