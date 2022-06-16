import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import { can } from '../Can';

const useStyles = makeStyles(theme => ({
  context: {
    marginTop: theme.spacing(2),
  },
}));

const MediaContext = ({ projectMedia, setError, setSaving }) => {
  const classes = useStyles();
  const claimDescription = projectMedia.claim_description;

  const hasPermission = can(projectMedia.permissions, 'create ClaimDescription');
  const readOnly = projectMedia.is_secondary || projectMedia.suggested_main_item;

  const handleBlur = (newValue) => {
    setError(false);
    if (hasPermission) {
      if (claimDescription) {
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: graphql`
            mutation MediaContextUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
              updateClaimDescription(input: $input) {
                claim_description {
                  id
                  dbid
                  updated_at
                  context
                  user {
                    name
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              id: claimDescription.id,
              context: newValue,
              description: claimDescription.description,
            },
          },
          onCompleted: (response, err) => {
            setSaving(false);
            if (err) {
              setError(true);
            } else {
              setError(false);
            }
          },
          onError: () => {
            setSaving(false);
            setError(true);
          },
        });
      } else if (newValue) {
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: graphql`
            mutation MediaContextCreateClaimDescriptionMutation($input: CreateClaimDescriptionInput!) {
              createClaimDescription(input: $input) {
                project_media {
                  permissions
                  claim_description {
                    id
                    dbid
                    updated_at
                    context
                    user {
                      name
                    }
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              context: newValue,
              project_media_id: projectMedia.dbid,
            },
          },
          onCompleted: (response, err) => {
            setSaving(false);
            if (err) {
              setError(true);
            } else {
              setError(false);
            }
          },
          onError: () => {
            setSaving(false);
            setError(true);
          },
        });
      }
    }
  };

  return (
    <Box id="media__context" className={classes.context}>
      <Box>
        <FormattedMessage
          id="mediaContext.placeholder"
          defaultMessage="Type something"
          description="Placeholder for claim context field."
        >
          { placeholder => (
            <TextField
              id="media-claim__context"
              className="media-claim__context"
              label={
                <FormattedMessage
                  id="mediaContext.title"
                  defaultMessage="Additional context"
                  description="Title of claim context field."
                />
              }
              placeholder={placeholder}
              defaultValue={claimDescription ? claimDescription.context : ''}
              onBlur={(e) => { handleBlur(e.target.value); }}
              variant="outlined"
              inputProps={{ style: { maxHeight: 266, overflow: 'auto' } }}
              rows={3}
              rowsMax={Infinity}
              disabled={!hasPermission || readOnly}
              multiline
              fullWidth
            />
          )}
        </FormattedMessage>
      </Box>
    </Box>
  );
};

MediaContext.defaultProps = {
  projectMedia: {
    claim_description: null,
  },
};

MediaContext.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number,
    permissions: PropTypes.string,
    is_secondary: PropTypes.bool,
    claim_description: PropTypes.shape({
      id: PropTypes.string,
      description: PropTypes.string,
      updated_at: PropTypes.string,
      user: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }),
};

export default MediaContext;
