import React from 'react';
import { IntlProvider } from 'react-intl';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { expect } from 'chai';
import { render } from 'enzyme';

import SourceAnnotation from '../../src/app/components/annotations/SourceAnnotation';

describe('<SourceAnnotation />', () => {
  const timestamp = new Date('2017-02-08 17:19:40 UTC').valueOf() / 1000;

  const annotation = {
    annotation_type: 'comment',
    content: JSON.stringify({ text: 'testing' }),
    updated_at: timestamp.toString(),
    created_at: timestamp.toString(),
    medias: { edges: [] },
    permissions: JSON.stringify({ 'read Comment': false, 'update Comment': true, 'destroy Comment': true }),
    annotator: { name: '', profile_image: null },
  };
  const annotated = {};

  it('should render annotation updated_at time', () => {
    const wrapper = render(<IntlProvider locale="en"><MuiThemeProvider><SourceAnnotation annotation={annotation} annotated={annotated} annotatedType={'ProjectSource'} /></MuiThemeProvider></IntlProvider>);
    const container = wrapper.find('.annotation__timestamp > time');
    expect(container.length).to.equal(1);
    expect(container.prop('title')).to.contain('2017-02-08');
  });
});
