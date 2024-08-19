/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import SmoochBotTextEditor from './SmoochBotTextEditor';
import { labels } from './localizables';

const SmoochBotMultiTextEditor = (props) => {
  const {
    currentLanguage,
    field,
    onChange,
    subSchema,
  } = props;
  let { value } = props;
  if (!value) {
    value = {};
  }

  return (
    <React.Fragment>
      <div className="typography-subtitle2">{labels[field]}</div>
      { Object.keys(subSchema.properties).map((key) => {
        let errorMessage = null;

        if (field === 'smooch_message_smooch_bot_tos' && key === 'greeting' && (value[key] && !/9/.test(value[key]))) {
          errorMessage = <FormattedMessage defaultMessage="The option '9' must be included for users to access the Privacy Statement" description="Error message about a missing option" id="smoochBotMultiTextEditor.errorNine" />;
        }

        return (
          <Box key={key} mb={2}>
            <SmoochBotTextEditor
              errorMessage={errorMessage}
              extraTextFieldProps={{ rows: 5 }}
              field={`${field}_${key}`}
              value={(value[key] || subSchema.properties[key].default[currentLanguage] || '').trim()}
              onChange={(newValue) => { onChange(key, newValue); }}
            />
          </Box>
        );
      })}
    </React.Fragment>
  );
};

SmoochBotMultiTextEditor.defaultProps = {
  value: null,
};

SmoochBotMultiTextEditor.propTypes = {
  value: PropTypes.object,
  field: PropTypes.string.isRequired,
  subSchema: PropTypes.object.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SmoochBotMultiTextEditor;
