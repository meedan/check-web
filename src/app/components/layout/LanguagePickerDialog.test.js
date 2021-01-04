import React from 'react';
import LanguagePickerDialog from './LanguagePickerDialog';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const current_team = {
  dbid: 1,
  name: 'teamName',
  slug: 'slugTeam',
};

describe('<LanguagePickerDialog />', () => {
  it('should render "choose language" dialog', () => {
    const wrapper = mountWithIntl(<LanguagePickerDialog
      open
      team={current_team}
      isSaving
    />);
    expect(wrapper.find('.add-language-action__cancel').hostNodes()).toHaveLength(1);
    expect(wrapper.find('.add-language-action__submit').hostNodes()).toHaveLength(1);
    expect(wrapper.find('input#autocomplete-add-language').hostNodes()).toHaveLength(1);
  });
});
