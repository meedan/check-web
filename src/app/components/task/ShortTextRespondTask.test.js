import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import ShortTextRespondTask from './ShortTextRespondTask';

describe('<ShortTextRespondTask />', () => {
  it('Hides buttons when not focused', () => {
    const task = mountWithIntl(<ShortTextRespondTask />);
    expect(task.find('.task__save')).toHaveLength(0);
  });

  it('Cannot submit empty response', () => {
    const task = mountWithIntl(<ShortTextRespondTask />);
    task.find('#task__response-input').hostNodes().simulate('focus');
    task.find('#task__response-input').hostNodes().simulate('change', { target: { name: 'response', value: '' } });
    expect(task.find('.task__save').hostNodes()).toHaveLength(1);
    expect(task.find('.task__save').hostNodes().html()).toMatch('disabled=""');
  });

  it('Can submit a response', () => {
    const task = mountWithIntl(<ShortTextRespondTask />);
    task.find('#task__response-input').hostNodes().simulate('focus');
    task.find('#task__response-input').hostNodes().simulate('change', { target: { name: 'response', value: 'a response' } });
    expect(task.find('.task__save').hostNodes()).toHaveLength(1);
    expect(task.find('.task__save').hostNodes().html()).not.toMatch('disabled=""');
  });

  it('Can edit a response', () => {
    const task = mountWithIntl(<ShortTextRespondTask response="text response" />);
    task.find('#task__response-input').hostNodes().simulate('focus');
    task.find('#task__response-input').hostNodes().simulate('change', { target: { name: 'response', value: 'an edited response' } });
    expect(task.find('.task__save').hostNodes()).toHaveLength(1);
    expect(task.find('.task__save').hostNodes().html()).not.toMatch('disabled=""');
  });

  it('Cannot remove a response', () => {
    const task = mountWithIntl(<ShortTextRespondTask response="text response" />);
    task.find('#task__response-input').hostNodes().simulate('focus');
    task.find('#task__response-input').hostNodes().simulate('change', { target: { name: 'response', value: '' } });
    expect(task.find('.task__save').hostNodes()).toHaveLength(1);
    expect(task.find('.task__save').hostNodes().html()).toMatch('disabled=""');
  });
});
