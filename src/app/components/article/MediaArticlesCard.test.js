import React from 'react';
import { MediaArticlesCard } from './MediaArticlesCard';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const team = {
  verification_statuses: {
    label: 'Status',
    default: 'undetermined',
    active: 'in_progress',
    statuses: [
      {
        id: 'false',
        locales: {
          en: {
            label: 'Totally False',
            description: 'Something that is not true',
          },
        },
        style: {
          color: 'red',
        },
        label: 'Totally False',
      },
    ],
  },
};

const explainer = {
  nodeType: 'Explainer',
  id: 'RXhwbGFpbmVyLzEK',
  title: 'Explainer title',
};

const factCheck = {
  nodeType: 'FactCheck',
  id: 'RmFjdENoZWNrLzEK',
  title: 'Fact-check title',
  rating: 'false',
};

describe('<MediaArticlesCard />', () => {
  it('should render explainer with icon and title', () => {
    const card = mountWithIntl(<MediaArticlesCard article={explainer} team={team} />);
    expect(card.find('svg')).toHaveLength(1);
    expect(card.html()).toMatch('Explainer title');
    expect(card.html()).not.toMatch('Fact-check title');
    expect(card.html()).not.toMatch('Totally False');
  });

  it('should render fact-check with icon, title and rating', () => {
    const card = mountWithIntl(<MediaArticlesCard article={factCheck} team={team} />);
    expect(card.find('svg')).toHaveLength(2); // Icon and rating circle
    expect(card.html()).not.toMatch('Explainer title');
    expect(card.html()).toMatch('Fact-check title');
    expect(card.html()).toMatch('Totally False');
  });
});
