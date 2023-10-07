import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconMoreVert from '../../../icons/more_vert.svg';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { FormattedGlobalMessage } from '../../MappedMessage';
import { FlashMessageSetterContext } from '../../FlashMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import { languageLabelFull } from '../../../LanguageRegistry';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';

const messages = defineMessages({
  deleteConfirmationText: {
    id: 'languageListItem.deleteConfirmationText',
    defaultMessage: 'Delete {language} and all content',
  },
});

function submitDefaultLanguage({
  team,
  code,
  onSuccess,
  onFailure,
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
  team,
  languages,
  onSuccess,
  onFailure,
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

const LanguageListItem = ({ code, team, intl }) => {
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

  const listItemText = (
    <span className="typography-h6">
      { languageLabelFull(code) }
    </span>
  );

  return (
    <React.Fragment>
      <ListItem>
        <ListItemText
          className={isDefault ? `language-list-item__${code}-default` : `language-list-item__${code}`}
        >
          { isDefault ? (
            <FormattedMessage
              id="languageListItem.default"
              defaultMessage="{language} (default)"
              description="Label to indicate that this language is the default"
              values={{ language: listItemText }}
            />
          ) : listItemText }
        </ListItemText>
        <ListItemSecondaryAction>
          <ButtonMain iconCenter={<IconMoreVert />} variant="outlined" size="default" theme="text" className="language-actions__menu" onClick={e => setAnchorEl(e.target)} />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem className="language-actions__make-default" onClick={handleMenuMakeDefault} disabled={isDefault}>
              <FormattedMessage id="statusListItem.makeDefault" defaultMessage="Make default" description="Menu item to make the current language the default" />
            </MenuItem>
            <MenuItem className="language-actions__delete" onClick={isDefault ? handleMenuDeleteDefault : handleMenuDelete}>
              <FormattedGlobalMessage messageKey="delete" />
            </MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
      { isTranslationPending ? (
        <ConfirmProceedDialog
          body={(
            <div>
              <p className="typography-body1">
                <FormattedMessage
                  id="statusListItem.translationNeededBody1"
                  defaultMessage="Not all statuses are currently translated into {language}!"
                  description="Warning message to tell the user there are missing translations for a status"
                  values={{ language: <strong>{languageLabelFull(code)}</strong> }}
                />
              </p>
              <p className="typography-body1">
                <FormattedMessage
                  id="statusListItem.translationNeededBody2"
                  defaultMessage="Before you can make {language} the default language you must first translate all existing statuses into {language} in the Statuses settings tab."
                  description="Warning message that a language cannot be default until all statuses are translated into that language"
                  values={{ language: <strong>{languageLabelFull(code)}</strong> }}
                />
              </p>
            </div>
          )}
          onProceed={() => setDefaultDialogOpen(false)}
          open={defaultDialogOpen}
          proceedLabel={<FormattedMessage id="statusListItem.translationNeededLabel" defaultMessage="Go back and translate statuses" description="Button label to return to the status translations area" />}
          title={
            <FormattedMessage
              id="statusListItem.translationNeededTitle"
              defaultMessage="You need to translate all statuses into {language}"
              description="Dialog title warning message that a language cannot be default until all statuses are translated into that language"
              values={{ language: languageLabelFull(code) }}
            />
          }
        />
      ) : (
        <ConfirmProceedDialog
          body={
            <div>
              <p className="typography-body1">
                <FormattedMessage
                  id="statusListItem.confirmDefaultBody1"
                  defaultMessage="This will change the default language from {currentDefaultLanguage} to {newDefaultLanguage}."
                  description="Confirmation message of the change in default language"
                  values={{
                    currentDefaultLanguage: <strong>{languageLabelFull(defaultLanguage)}</strong>,
                    newDefaultLanguage: <strong>{languageLabelFull(code)}</strong>,
                  }}
                />
              </p>
              <p className="typography-body1">
                <FormattedMessage
                  id="statusListItem.confirmDefaultBody2"
                  defaultMessage="{language} will become the default language to respond to users in the Tipline bot, Status or Report if they interact with the bot in any language not on this list, or if there is not a translation available for that language."
                  description="Description of what will happen when a new language becomes the default"
                  values={{ language: <strong>{languageLabelFull(code)}</strong> }}
                />
              </p>
            </div>
          }
          isSaving={isSaving}
          onCancel={() => setDefaultDialogOpen(false)}
          onProceed={submitDefault}
          open={defaultDialogOpen}
          proceedLabel={
            <FormattedMessage
              id="statusListItem.confirmDefaultButton"
              defaultMessage="Set {language} as default"
              description="Button label to continue to set a language as default"
              values={{ language: languageLabelFull(code) }}
            />
          }
          title={
            <FormattedMessage
              id="statusListItem.confirmDefaultTitle"
              defaultMessage="Do you want to set the default language to {language}?"
              description="Dialog title to confirm the user wants to set a new default language"
              values={{ language: languageLabelFull(code) }}
            />
          }
        />
      )
      }
      <ConfirmProceedDialog
        body={(
          <div>
            <p className="typography-body1">
              <FormattedMessage
                id="statusListItem.confirmDeleteBody1"
                defaultMessage="All content in {language} for the 'Tipline', 'Statuses' and 'Report' tabs will be deleted permanently."
                description="Warning about content being lost after deleting a language"
                values={{ language: languageLabelFull(code) }}
              />
            </p>
            <p className="typography-body1">
              <FormattedMessage
                id="statusListItem.confirmDeleteBody2"
                defaultMessage="Users will receive this content in the default language {language} instead."
                description="Description of which language a user will see by default"
                values={{ language: <strong>{languageLabelFull(defaultLanguage)}</strong> }}
              />
            </p>
          </div>
        )}
        typeTextToConfirm={intl.formatMessage(messages.deleteConfirmationText, { language: languageLabelFull(code) })}
        isSaving={isSaving}
        onCancel={() => setDeleteDialogOpen(false)}
        onProceed={submitDelete}
        open={deleteDialogOpen}
        proceedLabel={<FormattedMessage id="statusListItem.confirmDeleteLabel" defaultMessage="Delete language and all content" description="Button label for continuing to delete language content" />}
        title={<FormattedMessage id="statusListItem.confirmDeleteTitle" defaultMessage="Do you want to delete this content language?" description="Title for the dialog of deleting language content" />}
      />
      <ConfirmProceedDialog
        body={(
          <div>
            <p className="typography-body1">
              <FormattedMessage
                id="statusListItem.confirmDeleteDefaultBody"
                defaultMessage="You cannot delete the default language. You must set a different default language before you can delete {language}."
                description="Message warning user to set a new default language before deleting the current one"
                values={{ language: <strong>{languageLabelFull(defaultLanguage)}</strong> }}
              />
            </p>
          </div>
        )}
        onProceed={() => setDeleteDefaultDialogOpen(false)}
        open={deleteDefaultDialogOpen}
        proceedLabel={<FormattedMessage id="statusListItem.confirmDeleteDefaultLabel" defaultMessage="Go back and change" description="Button label to go back a step" />}
        title={<FormattedMessage id="statusListItem.confirmDeleteDefaultTitle" defaultMessage="You must first change the default language" description="Title for a dialog telling the user they must return to a previous process" />}
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
};

export default createFragmentContainer(injectIntl(LanguageListItem), graphql`
  fragment LanguageListItem_team on Team {
    id
    get_language
    get_languages
    verification_statuses
  }
`);
