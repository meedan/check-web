import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, commitMutation, graphql } from 'react-relay/compat';
import cx from 'classnames/bind';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import EditIcon from '../../icons/edit.svg';
import TextFieldsIcon from '../../icons/text_fields.svg';
import PermMediaIcon from '../../icons/perm_media.svg';
import NoteAltIcon from '../../icons/note_alt.svg';
import FactCheckIcon from '../../icons/fact_check.svg';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import { can } from '../Can';
import styles from './ItemTitle.module.css';

const ItemTitle = ({
  projectMedia,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [titleField, setTitleField] = React.useState(projectMedia.title_field);
  const [customTitle, setCustomTitle] = React.useState(projectMedia.custom_title);

  const canChange = can(projectMedia.permissions, 'update ProjectMedia') && projectMedia.archived !== CheckArchivedFlags.TRASHED;

  const pinnedMediaId = projectMedia.media_slug;
  const claimTitle = projectMedia.claim_description?.description;
  const factCheckTitle = projectMedia.claim_description?.fact_check?.title;

  const title = titleField ? {
    custom_title: customTitle,
    pinned_media_id: pinnedMediaId,
    claim_title: claimTitle,
    fact_check_title: factCheckTitle,
  }[titleField] : projectMedia.title;

  const icon = {
    custom_title: <TextFieldsIcon />,
    pinned_media_id: <PermMediaIcon />,
    claim_title: <NoteAltIcon />,
    fact_check_title: <FactCheckIcon />,
  }[titleField];

  const handleUpdate = (fields) => {
    setAnchorEl(null);
    setSaving(true);
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation ItemTitleUpdateProjectMediaMutation($input: UpdateProjectMediaInput!) {
          updateProjectMedia(input: $input) {
            project_media {
              id
              title
              title_field
              custom_title
            }
          }
        }
      `,
      variables: {
        input: {
          id: projectMedia.id,
          ...fields,
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
  };

  const handleUpdateTitleField = (newTitleField) => {
    if (newTitleField !== titleField) {
      if (newTitleField === 'custom_title') {
        handleUpdate({ title_field: newTitleField, custom_title: customTitle || projectMedia.title });
      } else {
        handleUpdate({ title_field: newTitleField });
      }
      setTitleField(newTitleField);
    }
  };

  const handleUpdateCustomTitle = (newCustomTitle) => {
    if (newCustomTitle !== customTitle) {
      handleUpdate({ custom_title: newCustomTitle });
      setCustomTitle(newCustomTitle);
    }
  };

  const ItemTitleOption = ({
    fieldName,
    optionIcon,
    disabled,
    label,
    helperText,
  }) => (
    <MenuItem
      key={fieldName}
      className={cx(
        `int-item-title__menu-item--${fieldName.replace('_', '-')}`,
        styles.itemTitleOption,
        titleField === fieldName ? styles.itemTitleOptionSelected : styles.itemTitleOptionNotSelected,
      )}
      disabled={disabled || false}
      onClick={() => handleUpdateTitleField(fieldName)}
    >
      <ListItemIcon className={styles.itemTitleOptionIcon}>
        {optionIcon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        secondary={
          disabled &&
          <span className={styles.itemTitleOptionHelperText}>
            {helperText}
          </span>
        }
      />
    </MenuItem>
  );

  return (
    <div className={styles.itemTitle}>
      <TextField
        key={`${titleField}-${title}-${saving}`}
        fullWidth
        className={cx(styles.itemTitleInputField, 'int-item-title__textfield--title')}
        defaultValue={title}
        margin="normal"
        variant="outlined"
        disabled={titleField !== 'custom_title' || saving || !canChange}
        iconLeft={icon}
        error={error}
        helpContent={
          error ?
            <FormattedMessage
              id="itemTitle.itemTitleError"
              defaultMessage="Could not update the title. Please try again and contact the support if the error persists"
              description="Error message displayed underneath the text field when an item title settings cannot be saved."
            /> : null
        }
        onBlur={e => handleUpdateCustomTitle(e.target.value)}
      />
      <ButtonMain
        iconCenter={<EditIcon />}
        size="large"
        variant="outlined"
        theme="text"
        disabled={saving || !canChange}
        onClick={(e) => {
          setError(false);
          setAnchorEl(e.currentTarget);
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <ListSubheader>
          <span className={cx('typography-body1-bold', styles.itemTitleMenuHeader)}>
            <FormattedMessage
              id="itemTitle.menuHeader"
              defaultMessage="Select Item Name"
              description="Header for a menu containing content options for item title"
            />
          </span>
        </ListSubheader>
        <ItemTitleOption
          fieldName="custom_title"
          optionIcon={<TextFieldsIcon />}
          label={
            <FormattedMessage
              id="itemTitle.customTitle"
              defaultMessage="Custom Title"
              description="Label for a menu item that selects Custom Title as the title field for an item."
            />
          }
        />
        <ItemTitleOption
          fieldName="pinned_media_id"
          optionIcon={<PermMediaIcon />}
          label={
            <FormattedMessage
              id="itemTitle.pinnedMediaId"
              defaultMessage="Pinned Media ID"
              description="Label for a menu item that selects Pinned Media ID as the title field for an item."
            />
          }
        />
        <ItemTitleOption
          fieldName="claim_title"
          optionIcon={<NoteAltIcon />}
          disabled={!projectMedia.claim_description}
          label={
            <FormattedMessage
              id="itemTitle.claimTitle"
              defaultMessage="Claim Title"
              description="Label for a menu item that selects Claim Title as the title field for an item."
            />
          }
          helperText={
            <FormattedMessage
              id="itemTitle.claimTitleHelper"
              defaultMessage="(Add a claim to enable)"
              description="Helper text displayed under the Claim Title option for an item title when the item has no claim."
            />
          }
        />
        <ItemTitleOption
          fieldName="fact_check_title"
          optionIcon={<FactCheckIcon />}
          disabled={!projectMedia.claim_description?.fact_check}
          label={
            <FormattedMessage
              id="itemTitle.factCheckTitle"
              defaultMessage="Fact-Check Title"
              description="Label for a menu item that selects Fact-Check Title as the title field for an item."
            />
          }
          helperText={
            <FormattedMessage
              id="itemTitle.factCheckTitleHelper"
              defaultMessage="(Add a fact-check to enable)"
              description="Helper text displayed under the Fact-Check Title option for an item title when the item has no fact-check."
            />
          }
        />
      </Menu>
    </div>
  );
};

ItemTitle.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired, // { key => value } (e.g., { 'update ProjectMedia' => true }), as a JSON string
    archived: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    title_field: PropTypes.oneOf(['custom_title', 'pinned_media_id', 'claim_title', 'fact_check_title']),
    custom_title: PropTypes.string,
    media_slug: PropTypes.string,
    claim_description: PropTypes.shape({
      description: PropTypes.string.isRequired,
      fact_check: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};

// For unit tests
// eslint-disable-next-line import/no-unused-modules
export { ItemTitle };

export default createFragmentContainer(ItemTitle, {
  projectMedia: graphql`
    fragment ItemTitle_projectMedia on ProjectMedia {
      id
      permissions
      archived
      title
      title_field
      custom_title
      media_slug
      claim_description {
        description
        fact_check {
          title
        }
      }
    }
  `,
});
