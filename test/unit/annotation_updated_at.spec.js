import React from 'react';
import { IntlProvider } from 'react-intl';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { expect } from 'chai';
import { render } from 'enzyme';

import Annotation from '../../src/app/components/source/Annotation';

describe('<Annotations />', () => {
  const annotation = {
    annotation_type: 'comment',
    content: JSON.stringify({ text: 'testing' }),
    updated_at: '2017-02-08 17:19:40 UTC',
    created_at: '2017-02-07 17:19:40 UTC',
    medias: { edges: [] },
    permissions: JSON.stringify({ 'read Comment': false, 'update Comment': true, 'destroy Comment': true }),
    annotator: { name: '', profile_image: null },
  };
  const annotated = {};

  it('should render annotation updated_at time', () => {
    const wrapper = render(<IntlProvider locale="en"><MuiThemeProvider><Annotation annotation={annotation} annotated={annotated} annotatedType={'ProjectMedia'} /></MuiThemeProvider></IntlProvider>);
    const container = wrapper.find('.annotation__timestamp > time');
    expect(container.length).to.equal(1);
    expect(container.prop('title')).to.contain('2017-02-08');
  });
});
