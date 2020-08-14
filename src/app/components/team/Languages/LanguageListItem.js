import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconMoreVert from '@material-ui/icons/MoreVert';
import TranslationNeededDialog from './TranslationNeededDialog';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { FormattedGlobalMessage } from '../../MappedMessage';
import { FlashMessageSetterContext } from '../../FlashMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import { safelyParseJSON, getErrorMessageForRelayModernProblem } from '../../../helpers';
import { languageLabel } from '../../../LanguageRegistry';

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

const LanguageListItem = ({ code, team }) => {
  const languages = safelyParseJSON(team.get_languages) || [];
  const isDefault = (code === team.get_language);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [defaultDialogOpen, setDefaultDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const isTranslationPending =
    checkTranslation(code, team.verification_statuses.statuses);

  const handleClose = () => setAnchorEl(null);

  const handleMenuDelete = () => {
    handleClose();
    setDeleteDialogOpen(true);
  };

  const submitDelete = () => {
    const onSuccess = () => {
      setIsSaving(false);
      setDeleteDialogOpen(false);
    };
    const onFailure = (errors) => {
      setIsSaving(false);
      setDeleteDialogOpen(false);
      console.error(errors); // eslint-disable-line no-console
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ));
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
      console.error(errors); // eslint-disable-line no-console
      setFlashMessage((
        getErrorMessageForRelayModernProblem(errors)
        || <GenericUnknownErrorMessage />
      ));
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
    <Typography variant="h6" component="span">
      { languageLabel(code) }
    </Typography>
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
              values={{ language: listItemText }}
            />
          ) : listItemText }
        </ListItemText>
        <ListItemSecondaryAction>
          <IconButton className="language-actions__menu" onClick={e => setAnchorEl(e.target)}>
            <IconMoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem className="language-actions__make-default" onClick={handleMenuMakeDefault} disabled={isDefault}>
              <FormattedMessage id="statusListItem.makeDefault" defaultMessage="Make default" />
            </MenuItem>
            <MenuItem className="language-actions__delete" onClick={handleMenuDelete} disabled={isDefault}>
              <FormattedGlobalMessage messageKey="delete" />
            </MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
      { isTranslationPending ? (
        <TranslationNeededDialog
          languageName={languageLabel(code)}
          open={defaultDialogOpen}
          onClose={() => setDefaultDialogOpen(false)}
        />
      ) : (
        <ConfirmProceedDialog
          body={
            <Typography variant="body1" component="p">
              <FormattedMessage
                id="statusListItem.confirmDefaultBody"
                defaultMessage="{language} will become the default one to respond to users who interact with the bot in any other languages than the ones added to this list."
                values={{ language: <strong>{languageLabel(code)}</strong> }}
              />
            </Typography>
          }
          isSaving={isSaving}
          onCancel={() => setDefaultDialogOpen(false)}
          onProceed={submitDefault}
          open={defaultDialogOpen}
          proceedLabel={<FormattedMessage id="statusListItem.confirmDefaultButton" defaultMessage="Set as default" />}
          title={<FormattedMessage id="statusListItem.confirmDefaultTitle" defaultMessage="Set as default language?" />}
        />
      )
      }
      <ConfirmProceedDialog
        body={(
          <div>
            <Typography variant="body1" component="p">
              <FormattedMessage
                id="statusListItem.confirmDeleteBody1"
                defaultMessage="All content in {language} will stop being sent, and the default language will be used instead."
                values={{ language: <strong>{languageLabel(code)}</strong> }}
              />
            </Typography>
            <Typography variant="body1" component="p">
              <FormattedMessage id="statusListItem.confirmDeleteBody2" defaultMessage="This includes content in the Tipline bot, Statuses, and Report." />
            </Typography>
          </div>
        )}
        isSaving={isSaving}
        onCancel={() => setDeleteDialogOpen(false)}
        onProceed={submitDelete}
        open={deleteDialogOpen}
        proceedLabel={<FormattedGlobalMessage messageKey="delete" />}
        title={<FormattedMessage id="statusListItem.confirmDeleteTitle" defaultMessage="Delete this language?" />}
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

export default createFragmentContainer(LanguageListItem, graphql`
  fragment LanguageListItem_team on Team {
    id
    get_language
    get_languages
    verification_statuses
  }
`);
