import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import CreateTask from '../../src/app/components/task/CreateTask';


describe('<CreateTask />', () => {
  const media_archived = { archived: true , permissions:"{\"create Task\": true }" };
  const media_not_archived = { archived: false, permissions:"{\"create Task\": true }" };
  
  it('Hides component when media is archived (Trash)', () => {
    const createTask = mountWithIntl(<CreateTask media={media_archived} />);
    expect(createTask.html()).toEqual('');
  });
  
  it('Render component when media is not archived (not in the trash)', () => {
    const createTask = mountWithIntl(<CreateTask media={media_not_archived} />);
    expect(createTask.html()).not.toEqual('');
  });

});