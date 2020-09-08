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

  const handleLanguageSubmit = (value) => {
    const onSuccess = () => {
      setCorrectingLanguage(false);
      setIsSaving(false);
    };

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="mediaTags.error"
          defaultMessage="Sorry, an error occurred while updating the tag. Please try again and contact {supportEmail} if the condition persists."
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

  return (
    <React.Fragment>
      <Chip
        className="media-tags__tag media-tags__language"
        deleteIcon={<EditIcon />}
        icon={<LanguageIcon />}
        label={
          <FormattedMessage
            className="media-tags__language-chip-label"
            id="mediaTags.language"
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
  projectMedia: PropTypes.object.isRequired, // FIXME write fitting shape
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
