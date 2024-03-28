import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import TextArea from '../cds/inputs/TextArea';
import { can } from '../Can';
import inputStyles from '../../styles/css/inputs.module.css';

const MediaContext = ({
  projectMedia,
  claimDescription,
  setError,
  setSaving,
}) => {
  // override to compensate for fast onBlur stateless component
  const textElement = document.querySelector('#media-claim__context');
  if (textElement && claimDescription && claimDescription.context && textElement.value !== claimDescription.context) {
    textElement.value = claimDescription.context;
  }

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
    <div id="media__context" className={inputStyles['form-fieldset-field']}>
      <FormattedMessage
        id="mediaContext.placeholder"
        defaultMessage="Add claim context"
        description="Placeholder for claim context field."
      >
        { placeholder => (
          <TextArea
            autoGrow
            maxHeight="266px"
            id="media-claim__context"
            className="media-claim__context"
            label={
              <FormattedMessage
                id="mediaContext.title"
                defaultMessage="Additional context"
                description="Title of claim additional context field."
              />
            }
            placeholder={placeholder}
            defaultValue={claimDescription ? claimDescription.context : ''}
            onBlur={(e) => { handleBlur(e.target.value); }}
            rows="1"
            disabled={!hasPermission || readOnly}
          />
        )}
      </FormattedMessage>
    </div>
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
