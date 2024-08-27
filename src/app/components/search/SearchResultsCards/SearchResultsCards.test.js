import React from 'react';
import { shallow } from 'enzyme';
import SearchResultsCards from './index';

const team = {
  verification_statuses: {
    statuses: [{
      id: 'test',
      label: 'Test',
      style: { color: 'red' },
    }],
  },
};

const projectMedias = [
  {
    feed_columns_values: {
      fact_check_title: 'Test 1',
      updated_at_timestamp: 1687921388,
      status: 'test',
      fact_check_summary: 'This is a test.',
      fact_check_url: 'https://test.test/1',
    },
  },
  {
    feed_columns_values: {
      fact_check_title: 'Test 2',
      updated_at_timestamp: 1687921389,
      status: 'test',
      fact_check_summary: 'This is another test.',
      fact_check_url: 'https://test.test/2',
    },
  },
];

describe('<SearchResultsCards />', () => {
  it('should render SearchResultsCards component', () => {
    const resultsComponent = shallow(<SearchResultsCards
      projectMedias={projectMedias}
      team={team}
    />);
    const results = resultsComponent.find('.search-results-cards');
    expect(results).toHaveLength(1);
  });

  it('should render one fact-check card for each item', () => {
    const resultsComponent = shallow(<SearchResultsCards
      projectMedias={projectMedias}
      team={team}
    />);
    const results = resultsComponent.find('.fact-check-card-wrapper').hostNodes();
    expect(results).toHaveLength(2);
  });

  it('should pass fact-check status label and color', () => {
    const resultsComponent = shallow(<SearchResultsCards
      projectMedias={[projectMedias[0]]}
      team={team}
    />);
    const card = resultsComponent.find('ArticleCard');
    expect(card.props().statusLabel).toBe('Test');
    expect(card.props().statusColor).toBe('red');
  });
});
