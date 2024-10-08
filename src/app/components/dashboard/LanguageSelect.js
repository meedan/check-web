import React from 'react';
import { FormattedMessage } from 'react-intl';
import Select from '../cds/inputs/Select';
import { safelyParseJSON } from '../../helpers';
import { languageLabelFull } from '../../LanguageRegistry';
import LanguageIcon from '../../icons/language.svg';

const LanguageSelect = ({ languages }) => {
  const options = safelyParseJSON(languages) || ['en'];

  if (!options) {
    return null;
  }

  return (
    <Select
      iconLeft={<LanguageIcon />}
      onChange={() => {}}
    >
      <FormattedMessage
        defaultMessage="Languages: All"
        description="Option to select all languages"
        id="dashboard.allLanguages"
      >
        {message => <option value="all">{message}</option>}
      </FormattedMessage>
      { options.map(option => (
        <option key={option} value={option}>{languageLabelFull(option)}</option>
      ))}
    </Select>
  );
};

export default LanguageSelect;
