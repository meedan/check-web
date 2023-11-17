import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, graphql, createFragmentContainer } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import { withSetFlashMessage } from '../FlashMessage';
import { safelyParseJSON } from '../../helpers';

const MediaLanguageSwitcher = ({ projectMedia, setFlashMessage }) => {
  const [saving, setSaving] = React.useState(false);

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="mediaLanguageSwitcher.error"
        defaultMessage="Could not change language, please try again"
        description="Error message displayed when it's not possible to change an item language"
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="mediaLanguageSwitcher.success"
        defaultMessage="Language updated"
        description="Success message displayed when an item language is changed"
      />
    ), 'success');
  };

  const handleUpdate = (value) => {
    const { languageCode } = value;
    setSaving(true);
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation MediaLanguageSwitcherUpdateDynamicAnnotationLanguageMutation($input: UpdateDynamicAnnotationLanguageInput!) {
          updateDynamicAnnotationLanguage(input: $input) {
            project_media {
              id
              language_code
            }
          }
        }
      `,
      variables: {
        input: {
          id: projectMedia.language?.id,
          set_fields: JSON.stringify({ language: languageCode }),
        },
      },
      onCompleted: (response, err) => {
        if (err) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  return (
    <LanguagePickerSelect
      label={<FormattedMessage id="mediaLanguageSwitcher.selectLanguageLabel" defaultMessage="Language" description="Label for input to select language" />}
      selectedLanguage={projectMedia.language_code}
      onSubmit={handleUpdate}
      languages={safelyParseJSON(projectMedia.team?.get_languages)}
      isDisabled={saving}
    />
  );
};

MediaLanguageSwitcher.propTypes = {
  projectMedia: PropTypes.shape({
    language_code: PropTypes.string.isRequired,
    language: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    team: PropTypes.shape({
      get_languages: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(MediaLanguageSwitcher), graphql`
  fragment MediaLanguageSwitcher_projectMedia on ProjectMedia {
    language_code
    team {
      get_languages
    }
    language: annotation(annotation_type: "language") {
      id
    }
  }
`);
