import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import ReportDesignerForm from './ReportDesignerForm';

describe('<ReportDesignerForm />', () => {
  const data = {
    use_text_message: true,
    use_introduction: false,
    introduction: '',
    image: '',
    title: 'title',
    headline: 'title',
    text: 'sumary',
    description: 'desc',
    published_article_url: '',
  };
  const media = {
    title: 'title',
  };
  const team = {
    get_languages: '[]',
  }

  it('should render report form', () => {
    const wrapper = mountWithIntl(<ReportDesignerForm
      state="published"
      media={media}
      data={data}
      team={team}
      onUpdate={() => {}}
      pending
      disabled={false}
    />);
    expect(wrapper.find('[data-testid="report-designer__introduction"]')).toHaveLength(1);
    expect(wrapper.find('[data-testid="report-designer__text-url"]')).toHaveLength(1);
  });
});
