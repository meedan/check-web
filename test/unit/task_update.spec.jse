import React from 'react';
import { IntlProvider } from 'react-intl';
import { mountWithIntl } from './helpers/intl-test';

import TaskUpdate from '../../src/app/components/annotations/TaskUpdate';

describe('<TaskUpdate />', () => {
  const activity_no_changes = {
    object_changes_json: '{}',
  };
  const activity_edited_title = {
    object_changes_json: '{"data":[{"label":"Old title","description":"This is a task"},{"label":"New edited title","description":"This is a task"}]}',
  };
  const activity_edited_description = {
    object_changes_json: '{"data":[{"label":"Same old title","description":"This is a task"},{"label":"Same old title","description":"This is an edited description."}]}',
  };
  const activity_created_description = {
    object_changes_json: '{"data":[{"label":"Same old title"},{"label":"Same old title","description":"This is a new description."}]}',
  };

  const authorName = 'Felis Catus';

  it('should render empty string if no changes', function() {
    const wrapper = mountWithIntl(<TaskUpdate activity={activity_no_changes} authorName={authorName} />);
    expect(wrapper.html()).toEqual(null);
  });

  it('should render edited title entry', function() {
    const wrapper = mountWithIntl(<TaskUpdate activity={activity_edited_title} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Task edited by Felis Catus: New edited title');
  });

  it('should render edited note entry', function() {
    const wrapper = mountWithIntl(<TaskUpdate activity={activity_edited_description} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Task note edited by Felis Catus: Same old title');
  });

  it('should render created note entry', function() {
    const wrapper = mountWithIntl(<TaskUpdate activity={activity_created_description} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Task note added by Felis Catus: Same old title');
  });
});
