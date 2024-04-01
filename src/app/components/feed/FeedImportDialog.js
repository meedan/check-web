import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import cx from 'classnames/bind';
import Dialog from '@material-ui/core/Dialog';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import IconClose from '../../icons/clear.svg';
import dialogStyles from '../../styles/css/dialog.module.css';
import { withSetFlashMessage } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import styles from './FeedItem.module.css';

const FeedImportDialog = ({
  cluster,
  feed,
  setFlashMessage,
  onClose,
}) => {
  const [importType, setImportType] = React.useState('create'); // or 'add' or 'search'
  const [claimTitle, setClaimTitle] = React.useState(null);
  const [claimContext, setClaimContext] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const onCompleted = (response) => {
    setFlashMessage(
      <FormattedMessage
        id="feedImportDialog.success"
        defaultMessage="Media Imported Successfully! {linkToImportedMedia}"
        description="Banner displayed after items are imported successfully."
        values={{
          linkToImportedMedia: (
            <a href={response.feedImportMedia.projectMedia.full_url} target="_blank" rel="noopener noreferrer">
              <FormattedMessage id="feedImportDialog.goToImported" defaultMessage="Go To Workspace Item" description="Link text for the link that takes to the imported item page." />
            </a>
          ),
        }}
      />,
      'success');
    setSaving(false);
    onClose();
  };

  const onError = (error) => {
    const errorMessage = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
    setFlashMessage(errorMessage);
    setSaving(false);
    onClose();
  };

  const handleImport = () => {
    setSaving(true);
    const input = {
      feedId: feed.dbid,
      projectMediaId: cluster.center.dbid,
      claimTitle,
      claimContext,
    };
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation FeedImportDialogFeedImportMediaMutation($input: ImportMediaInput!) {
          feedImportMedia(input: $input) {
            projectMedia {
              full_url
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
  };

  return (
    // Avoid closing the dialog when clicking on it
    <div onClick={(e) => { e.stopPropagation(); }} onKeyDown={(e) => { e.stopPropagation(); }}>
      <Dialog
        className={dialogStyles['dialog-window']}
        open
      >
        <div className={dialogStyles['dialog-title']}>
          <div>
            <FormattedMessage
              tagName="h6"
              id="feedImportDialog.title"
              defaultMessage="Import {mediaCount} media into your workspace"
              description="Title for the import media dialog on the feed item page."
              values={{
                mediaCount: cluster.media_count,
              }}
            />
            <ToggleButtonGroup
              value={importType}
              variant="contained"
              onChange={(e, newValue) => setImportType(newValue)}
              size="small"
              exclusive
            >
              <ToggleButton value="create" key="1">
                <FormattedMessage id="feedImportDialog.typeCreate" defaultMessage="Create New" description="Tab for import type on import dialog on feed item page." />
              </ToggleButton>
              <ToggleButton value="add" key="2">
                <FormattedMessage id="feedImportDialog.typeAdd" defaultMessage="Matched Item" description="Tab for import type on import dialog on feed item page." />
              </ToggleButton>
              <ToggleButton value="search" key="3">
                <FormattedMessage id="feedImportDialog.typeSearch" defaultMessage="Search for Item" description="Tab for import type on import dialog on feed item page." />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <ButtonMain
            className={dialogStyles['dialog-close-button']}
            variant="text"
            size="small"
            theme="text"
            iconCenter={<IconClose />}
            onClick={onClose}
          />
        </div>

        <div className={cx(dialogStyles['dialog-content'], styles.feedItemDialog)}>

          {/* First case: Create a new item */}
          { importType === 'create' && (
            <>
              <div className="typography-subtitle2">
                <FormattedMessage
                  id="feedImportDialog.explanationImportTypeCreate"
                  defaultMessage="Add an optional claim for the media being imported. This can also be done after completing the import."
                  description="Explanation on import dialog on feed item page."
                />
              </div>
              <TextField
                className="int-feed-import-dialog__textfield--claim-title"
                variant="outlined"
                label={<FormattedMessage id="feedImportDialog.claimTitle" defaultMessage="Claim title" description="Text field label on import dialog on feed item page." />}
                onBlur={e => setClaimTitle(e.target.value)}
              />
              <TextField
                className="int-feed-import-dialog__textfield--claim-context"
                variant="outlined"
                label={<FormattedMessage id="feedImportDialog.claimContext" defaultMessage="Additional context" description="Text field label on import dialog on feed item page." />}
                onBlur={e => setClaimContext(e.target.value)}
              />
            </>
          )}

        </div>

        {/* Footer */}
        <div className={dialogStyles['dialog-actions']}>
          <ButtonMain
            className="feed-import-dialog__close-button"
            size="default"
            theme="text"
            onClick={onClose}
            disabled={saving}
            label={
              <FormattedMessage
                id="feedImportDialog.cancel"
                defaultMessage="Cancel"
                description="Label of a button to close the import dialog window on the feed item page."
              />
            }
          />
          <ButtonMain
            className="feed-import-dialog__import-button"
            size="default"
            onClick={handleImport}
            disabled={saving}
            label={
              <FormattedMessage
                id="feedImportDialog.import"
                defaultMessage="Import Media"
                description="Label of a confirmation button on the import dialog window on the feed item page."
              />
            }
          />
        </div>
      </Dialog>
    </div>
  );
};

FeedImportDialog.defaultProps = {};

FeedImportDialog.propTypes = {
  cluster: PropTypes.shape({
    media_count: PropTypes.number.isRequired,
    center: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  feed: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default createFragmentContainer(withSetFlashMessage(FeedImportDialog), graphql`
  fragment FeedImportDialog_cluster on Cluster {
    media_count
    center {
      dbid
    }
  }
  fragment FeedImportDialog_feed on Feed {
    dbid
  }
`);
