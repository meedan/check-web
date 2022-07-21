import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import AddAnnotation from './AddAnnotation';
import CheckArchivedFlags from '../../CheckArchivedFlags';

describe('<AddAnnotation />', () => {
  const annotated_archived = { archived: CheckArchivedFlags.TRASHED };
  const annotated_not_archived = { archived: CheckArchivedFlags.NONE };

  it('Should hides when media is archived (Trash)', () => {
    const addAnnotation = mountWithIntl(<AddAnnotation annotated={annotated_archived} />);
    expect(addAnnotation.html()).toEqual(null);
    console.log(addAnnotation.debug());
  });

  it('Should render component when media is not archived (not in the trash)', () => {
    const addAnnotation = mountWithIntl(<AddAnnotation annotated={annotated_not_archived} />);
    console.log(addAnnotation.debug());
    expect(addAnnotation.html()).not.toEqual('');
  });
});
