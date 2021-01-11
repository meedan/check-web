import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import EmbedUpdate from './EmbedUpdate';

describe('<EmbedUpdate />', () => {
  const activity_no_changes = {
    object_changes_json: '{}',
  };
  const activity_edited_title = {
    object_changes_json: '{"data":[{"title":"Old title","description":"This is a tweet."},{"title":"New edited title","description":"This is a tweet."}]}',
  };
  const activity_edited_description = {
    object_changes_json: '{"data":[{"title":"Same old title","description":"This is a tweet."},{"title":"Same old title","description":"This is an edited description."}]}',
  };
  const activity_created_description = {
    object_changes_json: '{"data":[{"title":"Same old title"},{"title":"Same old title","description":"This is a new description."}]}',
  };

  const authorName = 'Felis Catus';

  it('should render empty string if no changes', function() {
    const wrapper = mountWithIntl(<EmbedUpdate activity={activity_no_changes} authorName={authorName} />);
    expect(wrapper.html()).toEqual(null);
  });

  it('should render edited title entry', function() {
    const wrapper = mountWithIntl(<EmbedUpdate activity={activity_edited_title} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Item title edited by Felis Catus: New edited title');
  });

  it('should render edited note entry', function() {
    const wrapper = mountWithIntl(<EmbedUpdate activity={activity_edited_description} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Item description edited by Felis Catus');
  });

  it('should render created note entry', function() {
    const wrapper = mountWithIntl(<EmbedUpdate activity={activity_created_description} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Item description added by Felis Catus');
  });
});
