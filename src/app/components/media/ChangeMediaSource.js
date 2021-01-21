import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

function ChangeMediaSource({
  team,
  keyword,
  onCancel,
  onSubmit,
  onChange,
  createNewClick,
}) {
  const [value, setValue] = React.useState(null);
  const [input, setInput] = React.useState(keyword);

  const handleSubmit = React.useCallback(() => {
    setValue(null);
    onSubmit(value);
  }, [onSubmit, value]);

  const teamSources = team.sources.edges.map(({ node }) => node);

  const handleChange = React.useCallback((ev, newValue, reason) => {
    switch (reason) {
    case 'select-option': setValue(newValue); break;
    case 'clear': setValue(null); break;
    default: break;
    }
  }, [value]);

  const handleInputChange = (ev, newInput, reason) => {
    if (reason === 'input') {
      setTimeout(() => {
        if (input !== newInput && newInput.length > 2) {
          onChange(newInput);
        }
      }, 1000);
      setInput(newInput);
    }
  };

  const createNew = (
    <Button
      style={{ color: 'blue' }}
      onClick={createNewClick}
    >
      <FormattedMessage
        id="changeMediaSource.createSource"
        defaultMessage="Create new"
        description="allow user to create a new source"
      />
    </Button>
  );

  return (
    <div id="media_source-change">
      <Autocomplete
        open={!value && teamSources.length > 0}
        autoHighlight
        options={input.length < 3 ? [] : teamSources}
        getOptionLabel={option => option.name}
        getOptionSelected={(option, val) => val !== null && option.id === val.id}
        inputValue={value ? value.name : input}
        value={value}
        onInputChange={handleInputChange}
        onChange={handleChange}
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
      <div>
        <Button color="primary" onClick={onCancel}>
          <FormattedMessage
            id="changeMediaSource.cancelButton"
            defaultMessage="Cancel"
            description="Cancel change media source action"
          />
        </Button>
        <Button
          color="primary"
          className="project-media-source-save-action"
          onClick={handleSubmit}
          disabled={!value}
        >
          <FormattedMessage
            id="changeMediaSource.saveButton"
            defaultMessage="Save"
            description="Save media source label"
          />
        </Button>
      </div>
    </div>
  );
}

ChangeMediaSource.defaultProps = {
  keyword: '',
};

ChangeMediaSource.propTypes = {
  keyword: PropTypes.string,
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func(<Project>) => undefined
  onChange: PropTypes.func.isRequired, // func(keyword) => undefined
  createNewClick: PropTypes.func.isRequired, // func() => undefined
};

export default createFragmentContainer(ChangeMediaSource, {
  team: graphql`
    fragment ChangeMediaSource_team on Team
    @argumentDefinitions(keyword: { type: "String!", defaultValue: "" }) {
      name
      sources(first: 10000, keyword: $keyword) {
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
