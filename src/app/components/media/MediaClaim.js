import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import TimeBefore from '../TimeBefore';
import MediaContext from './MediaContext';
import { parseStringUnixTimestamp } from '../../helpers';
import { can } from '../Can';

const useStyles = makeStyles(() => ({
  title: {
    fontSize: '16px',
  },
}));

const MediaClaim = ({ projectMedia }) => {
  const classes = useStyles();
  // If the item we are viewing is being suggested to a main item, show the claim for the main item. Otherwise show the claim associated with this item
  const claimDescription = projectMedia.suggested_main_item ? projectMedia.suggested_main_item.claim_description : projectMedia.claim_description;

  // override to compensate for fast onBlur stateless component
  const textElement = document.querySelector('#media-claim__description');
  if (textElement && textElement.value !== claimDescription.description) {
    textElement.value = claimDescription.description;
  }

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);

  const hasPermission = can(projectMedia.permissions, 'create ClaimDescription');
  const readOnly = projectMedia.is_secondary || projectMedia.suggested_main_item;

  const handleBlur = (newValue) => {
    setError(false);
    if (hasPermission) {
      if (claimDescription) {
        setSaving(true);
        commitMutation(Relay.Store, {
          mutation: graphql`
            mutation MediaClaimUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
              updateClaimDescription(input: $input) {
                claim_description {
                  id
                  dbid
                  updated_at
                  description
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
              description: newValue,
              context: claimDescription.context,
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
            mutation MediaClaimCreateClaimDescriptionMutation($input: CreateClaimDescriptionInput!) {
              createClaimDescription(input: $input) {
                project_media {
                  permissions
                  claim_description {
                    id
                    dbid
                    updated_at
                    description
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
              description: newValue,
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
    <Box id="media__claim">
      <Box id="media__claim-title" display="flex" alignItems="center" mb={2} justifyContent="space-between">
        <Typography className={classes.title} variant="body" component="div">
          <strong>
            <FormattedMessage id="mediaClaim.claim" defaultMessage="Claim" description="Title of the media claim section." />
          </strong>
        </Typography>
        {' '}
        <Typography variant="caption" component="div">
          { error ?
            <FormattedMessage
              id="mediaClaim.error"
              defaultMessage="error"
              description="Caption that informs that a claim could not be saved"
            /> : null }
          { saving && !error ?
            <FormattedMessage
              id="mediaClaim.saving"
              defaultMessage="saving…"
              description="Caption that informs that a claim is being saved"
            /> : null }
          { !saving && !error && claimDescription ?
            <FormattedMessage
              className="media-claim__saved-by"
              id="mediaClaim.saved"
              defaultMessage="saved by {userName} {timeAgo}"
              values={{
                userName: claimDescription.user.name,
                timeAgo: <TimeBefore date={parseStringUnixTimestamp(claimDescription.updated_at)} />,
              }}
              description="Caption that informs who last saved this claim and when it happened."
            /> : null }
          { !saving && !claimDescription && !error ? <span>&nbsp;</span> : null }
        </Typography>
      </Box>

      <Box>
        <FormattedMessage
          id="mediaClaim.placeholder"
          defaultMessage="For example: The earth is flat"
          description="Placeholder for claim description field."
        >
          { placeholder => (
            <TextField
              id="media-claim__description"
              className="media-claim__description"
              placeholder={placeholder}
              defaultValue={claimDescription ? claimDescription.description : ''}
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
      <Box id="hello">
        <MediaContext
          projectMedia={projectMedia}
          claimDescription={claimDescription}
          setSaving={setSaving}
          setError={setError}
        />
      </Box>
    </Box>
  );
};

MediaClaim.defaultProps = {
  projectMedia: {
    claim_description: null,
  },
};

MediaClaim.propTypes = {
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

export default MediaClaim;
