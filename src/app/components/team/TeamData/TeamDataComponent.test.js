import React from 'react';
import { mountWithIntl, getStore } from '../../../../../test/unit/helpers/intl-test';
import TeamDataComponent from './TeamDataComponent';

describe('<TeamDataComponent />', () => {
  it('Should not render table if there is no data', () => {
    const wrapper = mountWithIntl(<TeamDataComponent
      data={null}
      params={{}}
      route={{ action: 'settings' }}
    />);
    expect(wrapper.find('.team-data-component__with-data').hostNodes()).toHaveLength(0);
    expect(wrapper.find('.team-data-component__no-data').hostNodes()).toHaveLength(1);
  });

  it('Should render table if there is data', () => {
    const wrapper = mountWithIntl(<TeamDataComponent
      data={[{ 'Month': 'January 2022', 'Conversations': 123 }]}
      params={{}}
      route={{ action: 'settings' }}
    />);
    expect(wrapper.find('.team-data-component__with-data').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.team-data-component__no-data').hostNodes()).toHaveLength(0);
  });
});
