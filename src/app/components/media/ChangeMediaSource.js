/* eslint-disable relay/unused-fields, react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import cx from 'classnames/bind';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { can } from '../Can';
import inputStyles from '../../styles/css/inputs.module.css';

function ChangeMediaSource({
  createNewClick,
  onCancel,
  onSubmit,
  projectMediaPermissions,
  team,
}) {
  const [value, setValue] = React.useState(null);
  const [input, setInput] = React.useState('');

  const teamSources = team.sources.edges.map(({ node }) => node);

  const handleChange = (ev, newValue, reason) => {
    switch (reason) {
    case 'select-option':
      setValue(newValue);
      onSubmit(newValue);
      break;
    case 'clear':
      setValue(null);
      onSubmit(null);
      break;
    default: break;
    }
  };

  const handleInputChange = React.useCallback((ev, newValue, reason) => {
    if (reason === 'input') {
      setInput(newValue);
    }
  }, [input]);

  let createNew = null;
  if (can(projectMediaPermissions, 'create Source')) {
    createNew = (
      <ButtonMain
        buttonProps={{
          id: 'media-source__create-button',
        }}
        label={
          <FormattedMessage
            defaultMessage="Create new"
            description="allow user to create a new source"
            id="changeMediaSource.createSource"
          />
        }
        size="default"
        theme="lightText"
        variant="contained"
        onClick={() => { createNewClick(input); }}
      />
    );
  }

  return (
    <div className={cx(inputStyles['form-inner-wrapper'], inputStyles['form-inner-sticky'])} id="media_source-change">
      <div className={inputStyles['form-fieldset']}>
        <div className={cx(inputStyles['form-fieldset-field'], inputStyles['form-autocomplete-create'])}>
          <Autocomplete
            autoHighlight
            className="int-change-source__textfield--autocomplete"
            getOptionLabel={option => option.name}
            getOptionSelected={(option, val) => val !== null && option.id === val.id}
            inputValue={input}
            options={teamSources}
            renderInput={params => (
              <div ref={params.InputProps.ref}>
                <FormattedMessage defaultMessage="Choose a source" description="Change media source placeholder" id="changeMediaSource.choose">
                  { placeholder => (
                    <TextField
                      helpContent={<FormattedMessage defaultMessage="Add a source for this item" description="Helper text for the input to select an item source" id="changeMediaSource.helpContent" />}
                      label={<FormattedMessage defaultMessage="Source" description="Change media source label" id="changeMediaSource.chooseLabel" />}
                      name="source-name"
                      placeholder={placeholder}
                      {...params.inputProps}
                    />
                  )}
                </FormattedMessage>
              </div>
            )}
            value={value}
            onChange={handleChange}
            onInputChange={handleInputChange}
          />
          {createNew}
        </div>
      </div>
      <div className={inputStyles['form-footer-actions']}>
        <ButtonMain
          className="media-source__cancel-button"
          label={
            <FormattedMessage
              defaultMessage="Cancel"
              description="Cancel change media source action"
              id="changeMediaSource.cancelButton"
            />
          }
          size="default"
          theme="lightText"
          variant="text"
          onClick={onCancel}
        />
        <ButtonMain
          className="media-source__save-button"
          disabled={!value}
          label={
            <FormattedMessage
              defaultMessage="Save"
              description="Save media source label"
              id="changeMediaSource.saveButton"
            />
          }
          size="default"
          theme="info"
          variant="contained"
          onClick={() => { onSubmit(value); }}
        />
      </div>
    </div>
  );
}

ChangeMediaSource.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  projectMediaPermissions: PropTypes.object.isRequired, // ProjectMedia permissions
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func(<Project>) => undefined
  createNewClick: PropTypes.func.isRequired, // func() => undefined
};

export default createFragmentContainer(ChangeMediaSource, {
  team: graphql`
    fragment ChangeMediaSource_team on Team {
      name
      sources(first: 10000) {
        edges {
          node {
            id
            dbid
            name
          }
        }
      }
    }
  `,
});
