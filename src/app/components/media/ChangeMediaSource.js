/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import { can } from '../Can';
import inputStyles from '../../styles/css/inputs.module.css';

function ChangeMediaSource({
  team,
  projectMediaPermissions,
  onCancel,
  onSubmit,
  createNewClick,
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
        theme="brand"
        size="default"
        variant="text"
        onClick={() => { createNewClick(input); }}
        label={
          <FormattedMessage
            id="changeMediaSource.createSource"
            defaultMessage="Create new"
            description="allow user to create a new source"
          />
        }
        buttonProps={{
          id: 'media-source__create-button',
        }}
      />
    );
  }

  return (
    <div id="media_source-change" className={cx(inputStyles['form-inner-wrapper'], inputStyles['form-inner-sticky'])}>
      <Autocomplete
        autoHighlight
        options={teamSources}
        getOptionLabel={option => option.name}
        getOptionSelected={(option, val) => val !== null && option.id === val.id}
        value={value}
        onChange={handleChange}
        inputValue={input}
        onInputChange={handleInputChange}
        renderInput={params => (
          <TextField
            {...params}
            autoFocus
            name="source-name"
            label={
              <FormattedMessage
                id="changeMediaSource.choose"
                defaultMessage="Choose a source"
                description="Change media source label"
              />
            }
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {createNew}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
      <div className={inputStyles['form-footer-actions']}>
        <ButtonMain
          theme="lightText"
          size="default"
          variant="text"
          onClick={onCancel}
          className="media-source__cancel-button"
          label={
            <FormattedMessage
              id="changeMediaSource.cancelButton"
              defaultMessage="Cancel"
              description="Cancel change media source action"
            />
          }
        />
        <ButtonMain
          theme="brand"
          size="default"
          variant="contained"
          className="media-source__save-button"
          onClick={() => { onSubmit(value); }}
          disabled={!value}
          label={
            <FormattedMessage
              id="changeMediaSource.saveButton"
              defaultMessage="Save"
              description="Save media source label"
            />
          }
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
