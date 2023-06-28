import React from 'react';
import { shallow } from 'enzyme';
import FactCheckCard from './FactCheckCard';

describe('<FactCheckCard />', () => {
  it('should render FactCheckCard component', () => {
    const factCheckCardComponent = shallow(<FactCheckCard
      title="Test"
      statusLabel="Test"
      date={1687921388}
    />);
    const factCheckCard = factCheckCardComponent.find('.fact-check-card');
    expect(factCheckCard).toHaveLength(1);
  });
});
