import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import TimeBefore from '../TimeBefore';
import { parseStringUnixTimestamp } from '../../helpers';
import { can } from '../Can';

const MediaClaim = ({ projectMedia }) => {
  const claimDescription = projectMedia.claim_description;

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);

  const hasPermission = can(projectMedia.permissions, 'create ClaimDescription');
  const readOnly = projectMedia.is_secondary;

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
        <Typography variant="body" component="div">
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
        <TextField
          id="media-claim__description"
          className="media-claim__description"
          label={
            <FormattedMessage
              id="mediaClaim.description"
              defaultMessage="Type something"
              description="Placeholder for claim description field."
            />
          }
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
