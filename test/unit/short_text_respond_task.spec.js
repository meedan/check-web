import React from 'react';
import { mountWithIntl } from './helpers/intl-test';

import ShortTextRespondTask from '../../src/app/components/task/ShortTextRespondTask';

describe('<ShortTextRespondTask />', () => {
  it('Hides buttons when not focused', () => {
    const task = mountWithIntl(<ShortTextRespondTask />);
    expect(task.find('.task__save')).toHaveLength(0);
  });

  it('Cannot submit empty response', () => {
    const task = mountWithIntl(<ShortTextRespondTask />);
    task.setState({ response: '', focus: true });
    task.instance().canSubmit();
    expect(task.find('.task__save').at(0)).toHaveLength(1);
    expect(task.find('.task__save').at(0).html()).toMatch('disabled=""');
  });

  it('Cannot submit a note without response', () => {
    const task = mountWithIntl(<ShortTextRespondTask />);
    task.setState({ note: 'a note', focus: true });
    task.instance().canSubmit();
    expect(task.find('.task__save').at(0)).toHaveLength(1);
    expect(task.find('.task__save').at(0).html()).toMatch('disabled=""');
  });

  it('Can submit a response', () => {
    const task = mountWithIntl(<ShortTextRespondTask />);
    task.setState({ response: 'a response', focus: true });
    task.instance().canSubmit();
    expect(task.find('.task__save').at(0)).toHaveLength(1);
    expect(task.find('.task__save').at(0).html()).not.toMatch('disabled=""');
  });

  it('Can edit a response', () => {
    const task = mountWithIntl(<ShortTextRespondTask response="text response" />);
    task.setState({ response: 'an edited response', focus: true });
    task.instance().canSubmit();
    expect(task.find('.task__save').at(0)).toHaveLength(1);
    expect(task.find('.task__save').at(0).html()).not.toMatch('disabled=""');
  });

  it('Cannot remove a response', () => {
    const task = mountWithIntl(<ShortTextRespondTask response="text response" />);
    task.setState({ response: '', focus: true });
    task.instance().canSubmit();
    expect(task.find('.task__save').at(0)).toHaveLength(1);
    expect(task.find('.task__save').at(0).html()).toMatch('disabled=""');
  });

  it('Can edit a note', () => {
    const task = mountWithIntl(<ShortTextRespondTask response="text response" note="text note" />);
    task.setState({ note: 'a note', focus: true });
    task.instance().canSubmit();
    expect(task.find('.task__save').at(0)).toHaveLength(1);
    expect(task.find('.task__save').at(0).html()).not.toMatch('disabled=""');
  });
});
