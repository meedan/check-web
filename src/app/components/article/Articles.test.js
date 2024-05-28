import React from 'react';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import { ArticlesComponent } from './Articles';

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
    teamSlug: 'test',
    updateMutation: {},
    onChangeSearchParams: () => {},
    setFlashMessage: () => {},
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
    const wrapper = shallowWithIntl(<ArticlesComponent {...articlesProps} type="explainer" articles={explainers} />);
    expect(wrapper.find('ArticleCard')).toHaveLength(2);
  });
});
