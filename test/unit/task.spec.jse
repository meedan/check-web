import React from 'react';
import { IntlProvider } from 'react-intl';
import { render, shallow } from 'enzyme';
import { shallowWithIntl } from './helpers/intl-test';

import Task from '../../src/app/components/task/Task';

describe('<Task />', () => {
  const task = {
    first_response: {
      id: 1,
      annotator: {
        name: 'Alice'
      },
      content: 'Confirmed'
    }
  };

  it.skip('renders', function() {
    const task = render(<IntlProvider locale="en"><Task task={task} /></IntlProvider>);
    expect(mediaDetail.find('.task')).toHaveLength(1);
  });
});
