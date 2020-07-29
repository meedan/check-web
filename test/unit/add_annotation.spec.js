/* global describe, expect, it */
import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import AddAnnotation from '../../src/app/components/annotations/AddAnnotation';

describe('<AddAnnotation />', () => {
  const annotated_archived = { archived: true };
  const annotated_not_archived = { archived: false };

  it('Hides when media is archived (Trash)', () => {
    const addAnnotation = mountWithIntl(<AddAnnotation annotated={annotated_archived} />);
    expect(addAnnotation.html()).toEqual(null);
  });

  it('Render component when media is not archived (not in the trash)', () => {
    const addAnnotation = mountWithIntl(<AddAnnotation annotated={annotated_not_archived} />);
    expect(addAnnotation.html()).not.toEqual('');
  });
});
