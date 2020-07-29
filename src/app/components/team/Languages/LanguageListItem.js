import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconMoreVert from '@material-ui/icons/MoreVert';
import { FormattedGlobalMessage } from '../../MappedMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import languagesList from '../../../languagesList';

function submitLanguage({ input, onCompleted, onError }) {
  commitMutation(Store, {
    mutation: graphql`
      mutation LanguageListItemUpdateTeamMutation($input: UpdateTeamInput!) {
        updateTeam(input: $input) {
          team {
            id
            get_language
            get_languages
          }
        }
      }
    `,
    variables: {
      input,
    },
    onCompleted,
    onError,
  });
}

const LanguageListItem = ({
  code,
  isDefault,
  languages,
  team,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [defaultDialogOpen, setDefaultDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleClose = () => setAnchorEl(null);

  const handleMenuDelete = () => {
    handleClose();
    setDeleteDialogOpen(true);
  };

  const submitDelete = () => {
    const onCompleted = () => {
      setDeleteDialogOpen(false);
    };
    const onError = () => {
      setDeleteDialogOpen(false);
    };

    submitLanguage({
      input: {
        id: team.id,
        languages: JSON.stringify(languages.filter(l => l !== code)),
      },
      onCompleted,
      onError,
    });
  };

  const handleMenuMakeDefault = () => {
    handleClose();
    setDefaultDialogOpen(true);
  };

  const submitDefault = () => {
    const onCompleted = () => {
      setDefaultDialogOpen(false);
    };
    const onError = () => {
      setDefaultDialogOpen(false);
    };

    submitLanguage({
      input: {
        id: team.id,
        language: code,
      },
      onCompleted,
      onError,
    });
  };

  const languageLabel = languagesList[code] ? languagesList[code].nativeName : code;

  return (
    <React.Fragment>
      <ListItem>
        <ListItemText>
          { isDefault ? (
            <FormattedMessage
              id="languageListItem.default"
              defaultMessage="{languageLabel} (default)"
              values={{ languageLabel }}
            />
          ) : languageLabel }
        </ListItemText>
        <ListItemSecondaryAction>
          <IconButton className="status-actions__menu" onClick={e => setAnchorEl(e.target)}>
            <IconMoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem className="status-actions__make-default" onClick={handleMenuMakeDefault} disabled={isDefault}>
              <FormattedMessage id="statusListItem.makeDefault" defaultMessage="Make default" />
            </MenuItem>
            <MenuItem className="status-actions__delete" onClick={handleMenuDelete} disabled={isDefault}>
              <FormattedGlobalMessage messageKey="delete" />
            </MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
      <ConfirmProceedDialog
        body={<FormattedMessage id="statusListItem.confirmDefaultBody" defaultMessage="This language will become the default one to respond to users who interact with the bot in any other languages than the ones added to this list." />}
        onCancel={() => setDefaultDialogOpen(false)}
        onProceed={submitDefault}
        open={defaultDialogOpen}
        proceedLabel={<FormattedMessage id="statusListItem.confirmDefaultButton" defaultMessage="Set as default" />}
        title={<FormattedMessage id="statusListItem.confirmDefaultTitle" defaultMessage="Set as default language?" />}
      />
      <ConfirmProceedDialog
        body={(
          <div>
            <p>
              <FormattedMessage id="statusListItem.confirmDeleteBody1" defaultMessage="All content in this language will stop being sent, and the default language will be used instead." />
            </p>
            <p>
              <FormattedMessage id="statusListItem.confirmDeleteBody2" defaultMessage="This includes content in the Tipline bot, Statuses, and Report." />
            </p>
          </div>
        )}
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
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  team: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default LanguageListItem;
