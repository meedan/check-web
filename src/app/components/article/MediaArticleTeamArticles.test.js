import React from 'react';
import { shallow } from 'enzyme';
import { MediaArticlesTeamArticlesComponent } from './MediaArticlesTeamArticles';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

const explainer = {
  id: 'RXhwbGFpbmVyLzEK',
  title: 'Explainer title',
  nodeType: 'Explainer',
};

const factCheck = {
  id: 'RmFjdENoZWNrLzEK',
  title: 'Fact-check title',
  nodeType: 'FactCheck',
  rating: 'false',
};

const team = {
  explainer,
  factCheck,
};

const articles = [explainer, factCheck];

describe('<MediaArticlesTeamArticlesComponent />', () => {
  it('should render the correct message when there are no relevant articles', () => {
    const wrapper = mountWithIntlProvider(
      <MediaArticlesTeamArticlesComponent
        hasRelevantArticles={false}
        team={team}
        onAdd={() => {}}
      />,
    );

    expect(wrapper.text()).toContain('Choose a recent article to add to this media:');
  });

  it('should render the correct message when there are relevant articles to be chosen', () => {
    const wrapper = mountWithIntlProvider(
      <MediaArticlesTeamArticlesComponent
        hasRelevantArticles
        team={team}
        onAdd={() => {}}
      />,
    );

    expect(wrapper.text()).toContain('Choose a relevant article to add to this media:');
  });

  it('should render the no results message when searching', () => {
    const wrapper = mountWithIntlProvider(
      <MediaArticlesTeamArticlesComponent
        articles={[]}
        team={team}
        textSearch="some search"
        onAdd={() => {}}
      />,
    );

    expect(wrapper.text()).toContain('No results matched your search.');
  });

  it('should render article cards when articles are provided', () => {
    const wrapper = shallow(
      <MediaArticlesTeamArticlesComponent
        articles={articles}
        hasRelevantArticles={false}
        team={team}
        onAdd={() => {}}
      />,
    );

    expect(wrapper.find('ForwardRef(Relay(MediaArticlesCard))')).toHaveLength(articles.length);
    expect(wrapper.find('#articles-sidebar-team-articles').hostNodes()).toHaveLength(1);
  });

  it('should render no article cards when no articles are provided', () => {
    const wrapper = shallow(
      <MediaArticlesTeamArticlesComponent
        articles={[]}
        hasRelevantArticles={false}
        team={team}
        onAdd={() => {}}
      />,
    );

    expect(wrapper.find('ForwardRef(Relay(MediaArticlesCard))')).toHaveLength(0);
  });
});
