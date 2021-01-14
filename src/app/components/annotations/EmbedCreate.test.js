import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import EmbedCreate from './EmbedCreate';

describe('<EmbedCreate />', () => {
  const content_new_entry = {
    title: 'This is a quote',
  };

  const content_edited_title = {
    title: 'This is an edited title',
  };

  const content_created_description = {
    description: 'A description',
  };

  const annotated = {
    quote: 'This is a quote',
    media: {
      quote: 'This is a quote',
    },
  };

  const authorName = 'Felis Catus';

  it('should render new report entry', () => {
    const wrapper = mountWithIntl(<EmbedCreate content={content_new_entry} annotated={annotated} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Item added by Felis Catus');
  });

  it('should render edited title entry', () => {
    const wrapper = mountWithIntl(<EmbedCreate content={content_edited_title} annotated={annotated} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Item title edited by Felis Catus: This is an edited title');
  });

  it('should render created note entry', () => {
    const wrapper = mountWithIntl(<EmbedCreate content={content_created_description} annotated={annotated} authorName={authorName} />);
    expect(wrapper.html()).toMatch('Item description added by Felis Catus');
  });
});
