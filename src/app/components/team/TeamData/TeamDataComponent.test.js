import React from 'react';
import TeamDataComponent from './TeamDataComponent';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<TeamDataComponent />', () => {
  it('should not render table if there is no data', () => {
    const wrapper = mountWithIntl(<TeamDataComponent
      data={null}
      params={{}}
      route={{ action: 'settings' }}
      slug="test"
    />);
    expect(wrapper.find('.team-data-component__with-data').hostNodes()).toHaveLength(0);
    expect(wrapper.find('.team-data-component__no-data').hostNodes()).toHaveLength(1);
  });

  it('should render table if there is data', () => {
    const wrapper = mountWithIntl(<TeamDataComponent
      data={[{
        Month: 'January 2022',
        Conversations: 123,
        Language: 'en',
        Platform: 'WhatsApp',
        ID: 1,
      }]}
      params={{}}
      route={{ action: 'settings' }}
      slug="test"
    />);
    expect(wrapper.find('.team-data-component__with-data').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.team-data-component__no-data').hostNodes()).toHaveLength(0);
  });

  it('should list languages from data', () => {
    const data = [
      {
        Month: 'January 2022',
        Conversations: 123,
        Language: 'en',
        Platform: 'WhatsApp',
        ID: '1',
      },
      {
        Month: 'February 2022',
        Conversations: 456,
        Language: 'es',
        Platform: 'WhatsApp',
        ID: '2',
      },
    ];

    let wrapper = mountWithIntl(<TeamDataComponent
      data={data}
      params={{}}
      route={{ action: 'settings' }}
      slug="test"
    />);
    expect(wrapper.html()).toMatch('English');

    wrapper = mountWithIntl(<TeamDataComponent
      data={data}
      defaultLanguage="es"
      params={{}}
      route={{ action: 'settings' }}
      slug="test"
    />);
    expect(wrapper.html()).toMatch('Español');
  });
});
