import React from 'react';
import { mountWithIntl } from './helpers/intl-test';

import AddAnnotation from '../../src/app/components/annotations/AddAnnotation';

describe('<AddAnnotation />', () => {
  const annotated = { archived: true };
  const annotatedType = 'ProjectMedia';

  it('Hides when media is archived (Trash)', () => {
    const addAnnotation = mountWithIntl(<AddAnnotation annotated={annotated} />);
    expect(addAnnotation.html()).toEqual('');
  });
});
