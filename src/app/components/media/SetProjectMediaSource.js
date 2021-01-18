import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';

function SetProjectMediaSource({ team, onCancel, onSubmit }) {
  const teamSources = team.sources.edges.map(({ node }) => node);
  const [value, setValue] = React.useState(null);
  const handleSubmit = React.useCallback(() => {
    setValue(null);
    onSubmit(value);
  }, [onSubmit, value]);
  return (
    <div style={{ width: 300 }}>
      <Autocomplete
        autoHighlight
        options={teamSources}
        getOptionLabel={option => option.name}
        getOptionSelected={(option, val) => val !== null && option.id === val.id}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        renderInput={params => (
          <TextField
            {...params}
            autoFocus
            name="source-name"
            label={
              <FormattedMessage id="setProjectMediaSource.choose" defaultMessage="Choose a source" />
            }
            variant="outlined"
          />
        )}
      />
      <div>
        <Button color="primary" onClick={onCancel}>
          <FormattedMessage id="setProjectMediaSource.cancelButton" defaultMessage="Cancel" />
        </Button>
        <Button
          color="primary"
          className="project-media-source-save-action"
          onClick={handleSubmit}
          disabled={!value}
        >
          <FormattedMessage id="setProjectMediaSource.saveButton" defaultMessage="Save" />
        </Button>
      </div>
    </div>
  );
}

SetProjectMediaSource.propTypes = {
  team: PropTypes.object.isRequired,
};

export default createFragmentContainer(SetProjectMediaSource, {
  team: graphql`
    fragment SetProjectMediaSource_team on Team {
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
