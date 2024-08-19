import React from 'react';
import { ArticlesComponent } from './Articles';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<Articles />', () => {
  const article = {
    title: 'Title',
    description: 'Description',
    url: 'https://test.xyz',
    language: 'en',
    updated_at: 1716862848,
    tags: ['foo', 'bar'],
  };

  const articlesProps = {
    title: <span>Title</span>,
    icon: <div />,
    team: { slug: 'test', name: 'Test' },
    updateMutation: {},
    onChangeSearchParams: () => {},
  };

  it('should render explainers as cards', () => {
    const explainers = [
      {
        id: 'RXhwbGFpbmVyLzE=\n',
        ...article,
      },
      {
        id: 'RXhwbGFpbmVyLzI=\n',
        ...article,
      },
    ];
    const wrapper = shallowWithIntl(<ArticlesComponent {...articlesProps} articles={explainers} type="explainer" />);
    expect(wrapper.find('ArticleCard')).toHaveLength(2);
  });
});
