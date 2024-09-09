/* eslint-disable react/sort-prop-types */
import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedHTMLMessage, FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import cx from 'classnames/bind';
import IconMoreVert from '../../../icons/more_vert.svg';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { FormattedGlobalMessage } from '../../MappedMessage';
import { FlashMessageSetterContext } from '../../FlashMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import { languageLabelFull } from '../../../LanguageRegistry';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import settingsStyles from '../Settings.module.css';

const messages = defineMessages({
  deleteConfirmationText: {
    id: 'languageListItem.deleteConfirmationText',
    defaultMessage: 'Delete {language} and all content',
  },
});

function submitDefaultLanguage({
  code,
  onFailure,
  onSuccess,
  team,
}) {
  commitMutation(Store, {
    mutation: graphql`
      mutation LanguageListItemSetDefaultLanguageMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            id
            get_language
          }
        }
      }
    `,
    variables: {
      input: {
        id: team.id,
        language: code,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function submitDeleteLanguage({
  languages,
  onFailure,
  onSuccess,
  team,
}) {
  commitMutation(Store, {
    mutation: graphql`
      mutation LanguageListItemDeleteLanguageMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            id
            get_languages
            rules_json_schema
          }
        }
      }
    `,
    variables: {
      input: {
        id: team.id,
        languages,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function checkTranslation(code, statuses) {
  return statuses.some(s =>
    !s.locales[code] ||
    !s.locales[code].label ||
    !s.locales[code].label.trim());
}

const LanguageListItem = ({
  code,
  intl,
  setLanguages,
  team,
}) => {
  const languages = safelyParseJSON(team.get_languages) || [];
  const defaultLanguage = team.get_language;
  const isDefault = (code === defaultLanguage);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [defaultDialogOpen, setDefaultDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteDefaultDialogOpen, setDeleteDefaultDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const isTranslationPending =
    checkTranslation(code, team.verification_statuses.statuses);

  const handleClose = () => setAnchorEl(null);

  const handleMenuDelete = () => {
    handleClose();
    setDeleteDialogOpen(true);
  };

  const handleMenuDeleteDefault = () => {
    handleClose();
    setDeleteDefaultDialogOpen(true);
  };

  const submitDelete = () => {
    const onSuccess = () => {
      setIsSaving(false);
      setLanguages(languages.filter(l => l !== code));
      setDeleteDialogOpen(false);
    };
    const onFailure = (errors) => {
      setIsSaving(false);
      setDeleteDialogOpen(false);
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    setIsSaving(true);
    submitDeleteLanguage({
      team,
      languages: JSON.stringify(languages.filter(l => l !== code)),
      onSuccess,
      onFailure,
    });
  };

  const handleMenuMakeDefault = () => {
    handleClose();
    setDefaultDialogOpen(true);
  };

  const submitDefault = () => {
    if (isTranslationPending) return;

    const onSuccess = () => {
      setIsSaving(false);
      setDefaultDialogOpen(false);
    };
    const onFailure = (errors) => {
      setIsSaving(false);
      setDefaultDialogOpen(false);
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ), 'error');
    };

    setIsSaving(true);
    submitDefaultLanguage({
      team,
      code,
      onSuccess,
      onFailure,
    });
  };

  return (
    <React.Fragment>
      <li
        className={cx(
          settingsStyles['setting-content-list-language'],
          {
            [`language-list-item__${code}-default`]: isDefault,
            [`language-list-item__${code}`]: !isDefault,
          })
        }
      >
        <div>
          { isDefault ? (
            <FormattedHTMLMessage
              defaultMessage="<strong>{language}</strong> (default)"
              description="Label to indicate that this language is the default"
              id="languageListItem.default"
              values={{ language: languageLabelFull(code) }}
            />
          ) : <strong>{ languageLabelFull(code) }</strong>
          }
        </div>
        <div className={settingsStyles['setting-content-list-actions']}>
          <ButtonMain className="language-actions__menu" iconCenter={<IconMoreVert />} size="default" theme="text" variant="outlined" onClick={e => setAnchorEl(e.target)} />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem className="language-actions__make-default" disabled={isDefault} onClick={handleMenuMakeDefault}>
              <FormattedMessage defaultMessage="Make default" description="Menu item to make the current language the default" id="statusListItem.makeDefault" />
            </MenuItem>
            <MenuItem className="language-actions__delete" onClick={isDefault ? handleMenuDeleteDefault : handleMenuDelete}>
              <FormattedGlobalMessage messageKey="delete" />
            </MenuItem>
          </Menu>
        </div>
      </li>
      { isTranslationPending ? (
        <ConfirmProceedDialog
          body={(
            <div>
              <p className="typography-body1">
                <FormattedMessage
                  defaultMessage="Not all statuses are currently translated into {language}!"
                  description="Warning message to tell the user there are missing translations for a status"
                  id="statusListItem.translationNeededBody1"
                  values={{ language: <strong>{languageLabelFull(code)}</strong> }}
                />
              </p>
              <p className="typography-body1">
                <FormattedMessage
                  defaultMessage="Before you can make {language} the default language you must first translate all existing statuses into {language} in the Statuses settings tab."
                  description="Warning message that a language cannot be default until all statuses are translated into that language"
                  id="statusListItem.translationNeededBody2"
                  values={{ language: <strong>{languageLabelFull(code)}</strong> }}
                />
              </p>
            </div>
          )}
          open={defaultDialogOpen}
          proceedLabel={<FormattedMessage defaultMessage="Go back and translate statuses" description="Button label to return to the status translations area" id="statusListItem.translationNeededLabel" />}
          title={
            <FormattedMessage
              defaultMessage="You need to translate all statuses into {language}"
              description="Dialog title warning message that a language cannot be default until all statuses are translated into that language"
              id="statusListItem.translationNeededTitle"
              values={{ language: languageLabelFull(code) }}
            />
          }
          onProceed={() => setDefaultDialogOpen(false)}
        />
      ) : (
        <ConfirmProceedDialog
          body={
            <div>
              <p className="typography-body1">
                <FormattedMessage
                  defaultMessage="This will change the default language from {currentDefaultLanguage} to {newDefaultLanguage}."
                  description="Confirmation message of the change in default language"
                  id="statusListItem.confirmDefaultBody1"
                  values={{
                    currentDefaultLanguage: <strong>{languageLabelFull(defaultLanguage)}</strong>,
                    newDefaultLanguage: <strong>{languageLabelFull(code)}</strong>,
                  }}
                />
              </p>
              <p className="typography-body1">
                <FormattedMessage
                  defaultMessage="{language} will become the default language to respond to users in the Tipline bot, Status or Report if they interact with the bot in any language not on this list, or if there is not a translation available for that language."
                  description="Description of what will happen when a new language becomes the default"
                  id="statusListItem.confirmDefaultBody2"
                  values={{ language: <strong>{languageLabelFull(code)}</strong> }}
                />
              </p>
            </div>
          }
          isSaving={isSaving}
          open={defaultDialogOpen}
          proceedLabel={
            <FormattedMessage
              defaultMessage="Set {language} as default"
              description="Button label to continue to set a language as default"
              id="statusListItem.confirmDefaultButton"
              values={{ language: languageLabelFull(code) }}
            />
          }
          title={
            <FormattedMessage
              defaultMessage="Do you want to set the default language to {language}?"
              description="Dialog title to confirm the user wants to set a new default language"
              id="statusListItem.confirmDefaultTitle"
              values={{ language: languageLabelFull(code) }}
            />
          }
          onCancel={() => setDefaultDialogOpen(false)}
          onProceed={submitDefault}
        />
      )
      }
      <ConfirmProceedDialog
        body={(
          <div>
            <p className="typography-body1">
              <FormattedMessage
                defaultMessage="All content in {language} for the 'Tipline', 'Statuses' and 'Report' tabs will be deleted permanently."
                description="Warning about content being lost after deleting a language"
                id="statusListItem.confirmDeleteBody1"
                values={{ language: languageLabelFull(code) }}
              />
            </p>
            <p className="typography-body1">
              <FormattedMessage
                defaultMessage="Users will receive this content in the default language {language} instead."
                description="Description of which language a user will see by default"
                id="statusListItem.confirmDeleteBody2"
                values={{ language: <strong>{languageLabelFull(defaultLanguage)}</strong> }}
              />
            </p>
          </div>
        )}
        isSaving={isSaving}
        open={deleteDialogOpen}
        proceedLabel={<FormattedMessage defaultMessage="Delete language and all content" description="Button label for continuing to delete language content" id="statusListItem.confirmDeleteLabel" />}
        title={<FormattedMessage defaultMessage="Do you want to delete this content language?" description="Title for the dialog of deleting language content" id="statusListItem.confirmDeleteTitle" />}
        typeTextToConfirm={intl.formatMessage(messages.deleteConfirmationText, { language: languageLabelFull(code) })}
        onCancel={() => setDeleteDialogOpen(false)}
        onProceed={submitDelete}
      />
      <ConfirmProceedDialog
        body={(
          <div>
            <p className="typography-body1">
              <FormattedMessage
                defaultMessage="You cannot delete the default language. You must set a different default language before you can delete {language}."
                description="Message warning user to set a new default language before deleting the current one"
                id="statusListItem.confirmDeleteDefaultBody"
                values={{ language: <strong>{languageLabelFull(defaultLanguage)}</strong> }}
              />
            </p>
          </div>
        )}
        open={deleteDefaultDialogOpen}
        proceedLabel={<FormattedMessage defaultMessage="Go back and change" description="Button label to go back a step" id="statusListItem.confirmDeleteDefaultLabel" />}
        title={<FormattedMessage defaultMessage="You must first change the default language" description="Title for a dialog telling the user they must return to a previous process" id="statusListItem.confirmDeleteDefaultTitle" />}
        onProceed={() => setDeleteDefaultDialogOpen(false)}
      />
    </React.Fragment>
  );
};

LanguageListItem.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
    verification_statuses: PropTypes.shape({
      statuses: PropTypes.arrayOf((
        PropTypes.shape({
          locales: PropTypes.object.isRequired,
        }).isRequired
      )).isRequired,
    }).isRequired,
  }).isRequired,
  code: PropTypes.string.isRequired,
  setLanguages: PropTypes.func.isRequired,
};

export default createFragmentContainer(injectIntl(LanguageListItem), graphql`
  fragment LanguageListItem_team on Team {
    id
    get_language
    get_languages
    verification_statuses
  }
`);
