import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import cx from 'classnames/bind';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import TextArea from '../cds/inputs/TextArea';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import EditIcon from '../../icons/edit.svg';
import TextFieldsIcon from '../../icons/text_fields.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import PermMediaIcon from '../../icons/perm_media.svg';
import NoteAltIcon from '../../icons/note_alt.svg';
import FactCheckIcon from '../../icons/fact_check.svg';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import { can } from '../Can';
import styles from './ItemTitle.module.css';

const ItemTitleComponent = ({
  projectMedia,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [titleField, setTitleField] = React.useState(projectMedia.title_field);
  const [customTitle, setCustomTitle] = React.useState(projectMedia.custom_title);

  const canChange = can(projectMedia.permissions, 'update ProjectMedia') &&
                    !projectMedia.is_suggested &&
                    projectMedia.archived !== CheckArchivedFlags.TRASHED &&
                    projectMedia.archived !== CheckArchivedFlags.SPAM;

  const pinnedMediaId = projectMedia.media_slug;
  const claimTitle = projectMedia.claim_description?.description;
  const factCheckTitle = projectMedia.claim_description?.fact_check?.title;
  const fallbackTitle = claimTitle || factCheckTitle || projectMedia.title;

  React.useEffect(() => {
    if ((titleField === 'claim_title' && !claimTitle) || (titleField === 'fact_check_title' && !factCheckTitle)) {
      setTitleField('custom_title');
      setCustomTitle(projectMedia.title);
    } else if (!titleField) {
      setCustomTitle(fallbackTitle);
    }
  }, [claimTitle, factCheckTitle]);

  const title = titleField ? {
    custom_title: customTitle,
    pinned_media_id: pinnedMediaId,
    claim_title: claimTitle,
    fact_check_title: factCheckTitle,
  }[titleField] : fallbackTitle;

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
        const newCustomTitle = customTitle || projectMedia.title || '-';
        handleUpdate({ title_field: newTitleField, custom_title: newCustomTitle });
        setCustomTitle(newCustomTitle);
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
    disabled,
    fieldName,
    helperText,
    label,
    optionIcon,
  }) => (
    <MenuItem
      className={cx(
        `int-item-title__menu-item--${fieldName.replace('_', '-')}`,
        styles.itemTitleOption,
        titleField === fieldName ? styles.itemTitleOptionSelected : styles.itemTitleOptionNotSelected,
      )}
      disabled={Boolean(disabled) || false}
      key={fieldName}
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
      <div
        className={cx(
          styles.itemTitleWrapper,
          {
            [styles.itemTitleCustom]: titleField === 'custom_title',
          })
        }
      >
        <div
          className={cx(
            styles.itemTitleStatic,
            {
              [styles.itemTitleStaticIcon]: icon,
            })
          }
          title={title}
        >
          {icon}
          <span>
            {title}
          </span>
        </div>
        <TextArea
          autoGrow
          className={cx(styles.itemTitleInputField, 'int-item-title__textfield--title')}
          defaultValue={title}
          disabled={titleField !== 'custom_title' || saving || !canChange}
          error={error}
          helpContent={
            error ?
              <FormattedMessage
                defaultMessage="Could not update the title. Please try again and contact the support if the error persists"
                description="Error message displayed underneath the text field when an item title settings cannot be saved."
                id="itemTitle.itemTitleError"
              /> : null
          }
          iconLeft={icon}
          key={`${titleField}-${title}-${saving}`}
          maxHeight="60px"
          variant="outlined"
          onBlur={e => handleUpdateCustomTitle(e.target.value)}
        />
      </div>
      { canChange ?
        <Tooltip
          arrow
          title={
            <FormattedMessage
              defaultMessage="Customize the title for this Media"
              description="Tooltip for choosing the title for this media item"
              id="itemTitle.customizeTitleTooltip"
            />
          }
        >
          <span>
            <ButtonMain
              className={cx(styles.itemTitleMenuButton, 'int-item-title__button--menu')}
              disabled={saving}
              iconCenter={<EditIcon />}
              theme="text"
              variant="outlined"
              onClick={(e) => {
                setError(false);
                setAnchorEl(e.currentTarget);
              }}
            />
          </span>
        </Tooltip> : null
      }
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <ListSubheader>
          <span className={cx('typography-body1-bold', styles.itemTitleMenuHeader)}>
            <FormattedMessage
              defaultMessage="Select Media Cluster Name"
              description="Header for a menu containing content options for title of the cluster of media"
              id="itemTitle.menuHeader"
            />
          </span>
        </ListSubheader>
        <ItemTitleOption
          fieldName="custom_title"
          label={
            <FormattedMessage
              defaultMessage="Custom Title"
              description="Label for a menu item that selects Custom Title as the title field for an item."
              id="itemTitle.customTitle"
            />
          }
          optionIcon={<TextFieldsIcon />}
        />
        <ItemTitleOption
          disabled={!pinnedMediaId}
          fieldName="pinned_media_id"
          helperText={
            <FormattedMessage
              defaultMessage="(Add a media to enable)"
              description="Helper text displayed under the Pinned Media Title option for an item title when the item has no media."
              id="itemTitle.pinnedMediaIdHelper"
            />
          }
          label={
            <FormattedMessage
              defaultMessage="Pinned Media Title"
              description="Label for a menu item that selects Pinned Media Title as the title field for an item."
              id="itemTitle.pinnedMediaId"
            />
          }
          optionIcon={<PermMediaIcon />}
        />
        <ItemTitleOption
          disabled={!claimTitle}
          fieldName="claim_title"
          helperText={
            <FormattedMessage
              defaultMessage="(Add a claim to enable)"
              description="Helper text displayed under the Claim Title option for an item title when the item has no claim."
              id="itemTitle.claimTitleHelper"
            />
          }
          label={
            <FormattedMessage
              defaultMessage="Claim Title"
              description="Label for a menu item that selects Claim Title as the title field for an item."
              id="itemTitle.claimTitle"
            />
          }
          optionIcon={<NoteAltIcon />}
        />
        <ItemTitleOption
          disabled={!factCheckTitle}
          fieldName="fact_check_title"
          helperText={
            <FormattedMessage
              defaultMessage="(Add a fact-check to enable)"
              description="Helper text displayed under the Fact-Check Title option for an item title when the item has no fact-check."
              id="itemTitle.factCheckTitleHelper"
            />
          }
          label={
            <FormattedMessage
              defaultMessage="Fact-Check Title"
              description="Label for a menu item that selects Fact-Check Title as the title field for an item."
              id="itemTitle.factCheckTitle"
            />
          }
          optionIcon={<FactCheckIcon />}
        />
      </Menu>
    </div>
  );
};

ItemTitleComponent.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired, // { key => value } (e.g., { 'update ProjectMedia' => true }), as a JSON string
    archived: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    title_field: PropTypes.oneOf(['custom_title', 'pinned_media_id', 'claim_title', 'fact_check_title']),
    custom_title: PropTypes.string,
    media_slug: PropTypes.string,
    is_suggested: PropTypes.bool.isRequired,
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
export { ItemTitleComponent };

const ItemTitle = ({ projectMediaId }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ItemTitleQuery($id: String!) {
        projectMedia: project_media(ids: $id) {
          id
          permissions
          archived
          title
          title_field
          custom_title
          media_slug
          is_suggested
          claim_description {
            description
            fact_check {
              title
            }
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return (<ItemTitleComponent projectMedia={props.projectMedia} />);
      }
      return null;
    }}
    variables={{
      id: `${projectMediaId},,`,
    }}
  />
);

ItemTitle.propTypes = {
  projectMediaId: PropTypes.number.isRequired,
};

export default ItemTitle;
