import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Chip from '@material-ui/core/Chip';
import EditIcon from '@material-ui/icons/Edit';
import LanguageIcon from '@material-ui/icons/Language';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import LanguagePickerDialog from '../layout/LanguagePickerDialog';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import UpdateLanguageMutation from '../../relay/mutations/UpdateLanguageMutation';

const MediaLanguageChip = ({ projectMedia, setFlashMessage }) => {
  const [correctingLanguage, setCorrectingLanguage] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // FIXME Modernize mutation
  const handleLanguageSubmit = (value) => {
    const onSuccess = () => {
      setCorrectingLanguage(false);
      setIsSaving(false);
    };

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="mediaLanguageChip.error"
          defaultMessage="Sorry, an error occurred while updating the language. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const errorMessage = getErrorMessage(transaction, fallbackMessage);
      setFlashMessage(errorMessage);
      setIsSaving(false);
    };

    setIsSaving(true);

    Relay.Store.commitUpdate(
      new UpdateLanguageMutation({
        id: projectMedia.dynamic_annotation_language.id,
        projectMediaId: projectMedia.id,
        languageCode: value.languageCode,
        languageName: value.languageName,
      }),
      { onSuccess, onFailure },
    );
  };

  if (!projectMedia.dynamic_annotation_language) {
    return null;
  }

  return (
    <React.Fragment>
      <Chip
        className="media-tags__tag media-tags__language"
        deleteIcon={<EditIcon />}
        icon={<LanguageIcon />}
        label={
          <FormattedMessage
            className="media-tags__language-chip-label"
            id="mediaLanguageChip.language"
            defaultMessage="Language: {language}"
            values={{ language: projectMedia.language }}
          />
        }
        onDelete={
          can(projectMedia.permissions, 'create Dynamic') ?
            () => setCorrectingLanguage(true) : null
        }
      />
      <LanguagePickerDialog
        isSaving={isSaving}
        open={correctingLanguage}
        onDismiss={() => setCorrectingLanguage(false)}
        onSubmit={handleLanguageSubmit}
        team={projectMedia.team}
      />
    </React.Fragment>
  );
};

MediaLanguageChip.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    language: PropTypes.string,
    language_code: PropTypes.string,
    permissions: PropTypes.string.isRequired,
    dynamic_annotation_language: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
    team: PropTypes.shape({
      id: PropTypes.string.isRequired,
      get_languages: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(MediaLanguageChip), graphql`
  fragment MediaLanguageChip_projectMedia on ProjectMedia {
    id
    language
    language_code
    permissions
    dynamic_annotation_language {
      id
    }
    team {
      id
      get_languages
    }
  }
`);
