import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

function ChangeMediaSource({
  team,
  onCancel,
  onSubmit,
}) {
  const [value, setValue] = React.useState(null);
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

  return (
    <div id="media_source-change" style={{ padding: '8px 5px', width: '85%' }}>
      <Autocomplete
        autoHighlight
        options={teamSources}
        getOptionLabel={option => option.name}
        getOptionSelected={(option, val) => val !== null && option.id === val.id}
        value={value}
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
ChangeMediaSource.propTypes = {
  team: PropTypes.object.isRequired, // GraphQL "Team" object (current team)
  onCancel: PropTypes.func.isRequired, // func() => undefined
  onSubmit: PropTypes.func.isRequired, // func(<Project>) => undefined
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
