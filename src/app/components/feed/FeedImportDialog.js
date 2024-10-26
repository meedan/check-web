import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import cx from 'classnames/bind';
import Dialog from '@material-ui/core/Dialog';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import IconClose from '../../icons/clear.svg';
import SmallMediaCard from '../cds/media-cards/SmallMediaCard';
import AutoCompleteMediaItem from '../media/AutoCompleteMediaItem';
import dialogStyles from '../../styles/css/dialog.module.css';
import { withSetFlashMessage } from '../FlashMessage';
import { getErrorMessage } from '../../helpers';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ParsedText from '../ParsedText';
import styles from './FeedItem.module.css';
import mediaStyles from '../media/media.module.css';

const FeedImportDialog = ({
  cluster,
  feed,
  intl,
  onClose,
  setFlashMessage,
  team,
}) => {
  const [claimTitle, setClaimTitle] = React.useState(null);
  const [claimContext, setClaimContext] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  // Check if this workspace has an item in the cluster
  let defaultImportType = 'search';
  let item = null;
  if (cluster?.project_medias?.edges?.length > 0) {
    item = cluster.project_medias.edges[0].node;
    defaultImportType = 'add';
  }

  const [importType, setImportType] = React.useState(defaultImportType); // 'add', 'create' or 'search'

  const onCompleted = (response) => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Media Imported Successfully! It may take a while until all items are actually imported. {linkToImportedMedia}"
        description="Banner displayed after items are imported successfully."
        id="feedImportDialog.success"
        values={{
          linkToImportedMedia: (
            <a className={styles.feedImportSuccessLink} href={response.feedImportMedia.projectMedia.full_url} rel="noopener noreferrer" target="_blank">
              <FormattedMessage defaultMessage="Go To Workspace Item" description="Link text for the link that takes to the imported item page." id="feedImportDialog.goToImported" />
            </a>
          ),
        }}
      />,
      'success');
    setSaving(false);
    onClose();
  };

  const onError = (error) => {
    const errorMessage = getErrorMessage(error);
    const errorComponent = errorMessage ? <ParsedText text={errorMessage} /> : <GenericUnknownErrorMessage />;
    setFlashMessage(errorComponent);
    setSaving(false);
    onClose();
  };

  const canImport = (importType === 'create' || (importType === 'add' && item) || (importType === 'search' && selectedItem));

  const handleImport = () => {
    setSaving(true);
    const input = {
      feedId: feed.dbid,
      projectMediaId: cluster.center.dbid,
    };
    if (importType === 'create') {
      input.claimTitle = claimTitle;
      input.claimContext = claimContext;
    }
    if (importType === 'add' && item) {
      input.parentId = item.dbid;
    }
    if (importType === 'search' && selectedItem) {
      input.parentId = selectedItem.dbid;
    }
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
    <div id="feed-import-dialog" onClick={(e) => { e.stopPropagation(); }} onKeyDown={(e) => { e.stopPropagation(); }}>
      <Dialog
        className={dialogStyles['dialog-window']}
        open
      >
        <div className={dialogStyles['dialog-title']}>
          <div className={dialogStyles['dialog-title-choice']}>
            <FormattedMessage
              defaultMessage="{mediaCount, plural, one {Import # Media Clusters to your Workspace} other {Import # Media Clusters to your Workspace}}"
              description="Title for the import media dialog on the feed item page."
              id="feedImportDialog.title"
              tagName="h6"
              values={{
                mediaCount: cluster.media_count,
              }}
            />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={importType}
              variant="contained"
              onChange={(e, newValue) => setImportType(newValue)}
            >
              <ToggleButton key="1" value="create">
                <FormattedMessage defaultMessage="Create New" description="Tab for import type on import dialog on feed item page." id="feedImportDialog.typeCreate" />
              </ToggleButton>
              <ToggleButton key="2" value="add">
                <FormattedMessage defaultMessage="Matched Item" description="Tab for import type on import dialog on feed item page." id="feedImportDialog.typeAdd" />
              </ToggleButton>
              <ToggleButton key="3" value="search">
                <FormattedMessage defaultMessage="Search for Item" description="Tab for import type on import dialog on feed item page." id="feedImportDialog.typeSearch" />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <ButtonMain
            className={dialogStyles['dialog-close-button']}
            iconCenter={<IconClose />}
            size="small"
            theme="text"
            variant="text"
            onClick={onClose}
          />
        </div>

        <div className={cx(dialogStyles['dialog-content'], styles.feedItemDialog)}>

          {/* First case: Create a new item */}
          { importType === 'create' && (
            <div className={styles.feedItemDialogForm} id="feed-import-dialog__create">
              <div className="typography-subtitle2">
                <FormattedMessage
                  defaultMessage="Add an optional claim for the media being imported. This can also be done after completing the import."
                  description="Explanation on import dialog on feed item page."
                  id="feedImportDialog.explanationImportTypeCreate"
                />
              </div>
              <TextField
                className="int-feed-import-dialog__textfield--claim-title"
                label={<FormattedMessage defaultMessage="Claim title" description="Text field label on import dialog on feed item page." id="feedImportDialog.claimTitle" />}
                variant="outlined"
                onBlur={e => setClaimTitle(e.target.value)}
              />
              <TextField
                className="int-feed-import-dialog__textfield--claim-context"
                label={<FormattedMessage defaultMessage="Additional context" description="Text field label on import dialog on feed item page." id="feedImportDialog.claimContext" />}
                variant="outlined"
                onBlur={e => setClaimContext(e.target.value)}
              />
            </div>
          )}

          {/* Second case: Add to cluster item when the current workspace is part of the cluster */}
          { importType === 'add' && item && (
            <div id="feed-import-dialog__add">
              <div className="typography-subtitle2">
                <FormattedMessage
                  defaultMessage="Add the selected media to your matching workspace item."
                  description="Explanation on import dialog on feed item page."
                  id="feedImportDialog.explanationImportTypeAdd"
                />
                <br />
              </div>
              <SmallMediaCard
                customTitle={item.title}
                description={team.description}
                details={[
                  (
                    item.last_seen &&
                      <FormattedMessage
                        defaultMessage="Last submitted {date}"
                        description="Shows the last time a media was submitted (on feed import dialog media card)"
                        id="feedImportDialog.lastSubmitted"
                        values={{
                          date: intl.formatDate(item.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
                        }}
                      />
                  ),
                  (
                    item.requests_count &&
                      <FormattedMessage
                        defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                        description="Header of requests list. Example: 26 requests."
                        id="feedImportDialog.requestsCount"
                        values={{ requestsCount: item.requests_count }}
                      />
                  ),
                ]}
                media={item.media}
              />
            </div>
          )}

          {/* Second case: Add to cluster item when the current workspace is not part of the cluster */}
          { importType === 'add' && !item && (
            <div className={styles.feedImportNotInCluster}>
              <div className="typography-subtitle2">
                <FormattedMessage
                  defaultMessage="Your workspace does not contribute to this shared feed item."
                  description="Explanation on import dialog on feed item page."
                  id="feedImportDialog.addNotPart1"
                />
              </div>
              <div className="typography-subtitle2">
                <FormattedMessage
                  defaultMessage="You can import this media in a {newItemLink}, or search for an {existingItemLink}."
                  description="Explanation on import dialog on feed item page... the default in English for 'newItemLink' is 'new item in your workspace', while for 'existingItemLink' it's 'existing item to import'."
                  id="feedImportDialog.addNotPart2"
                  values={{
                    newItemLink: (
                      <span className={styles.feedImportLink} onClick={() => { setImportType('create'); }} onKeyDown={() => { setImportType('create'); }}>
                        <FormattedMessage
                          defaultMessage="new item in your workspace"
                          description="This is the text of the link to create a new item in the feed import dialog. It's used in the middle of a sentence like: You can import this media in a 'new item in your workspace'."
                          id="feedImportDialog.addNotPartLinkNew"
                        />
                      </span>
                    ),
                    existingItemLink: (
                      <span className={styles.feedImportLink} onClick={() => { setImportType('search'); }} onKeyDown={() => { setImportType('search'); }}>
                        <FormattedMessage
                          defaultMessage="existing item to import"
                          description="This is the text of the link to create a new item in the feed import dialog. It's used in the middle of a sentence like: You can import this media in a new item or search for an 'existing item to import'."
                          id="feedImportDialog.addNotPartLinkSearch"
                        />
                      </span>
                    ),
                  }}
                />
              </div>
            </div>
          )}

          {/* Third case: Search for media */}
          { importType === 'search' && (
            <div className={cx(styles.feedImportSearch, mediaStyles['media-item-autocomplete-wrapper'])} id="feed-import-dialog__search">
              <AutoCompleteMediaItem onSelect={setSelectedItem} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={dialogStyles['dialog-actions']}>
          <ButtonMain
            className="feed-import-dialog__close-button"
            disabled={saving}
            label={
              <FormattedMessage
                defaultMessage="Cancel"
                description="Regular Cancel action label"
                id="global.cancel"
              />
            }
            size="default"
            theme="text"
            onClick={onClose}
          />
          <ButtonMain
            className="feed-import-dialog__import-button"
            disabled={saving || !canImport}
            label={
              <FormattedMessage
                defaultMessage="Import Media Clusters"
                description="Label of a confirmation button on the import dialog window on the feed item page."
                id="feedImportDialog.import"
              />
            }
            size="default"
            onClick={handleImport}
          />
        </div>
      </Dialog>
    </div>
  );
};

FeedImportDialog.defaultProps = {
  onClose: () => {},
};

FeedImportDialog.propTypes = {
  cluster: PropTypes.shape({
    media_count: PropTypes.number.isRequired,
    center: PropTypes.shape({
      dbid: PropTypes.number.isRequired,
    }).isRequired,
    project_medias: PropTypes.exact({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          dbid: PropTypes.number.isRequired,
          title: PropTypes.string,
          description: PropTypes.string,
          last_seen: PropTypes.string,
          requests_count: PropTypes.number,
          media: PropTypes.object,
        }),
      })),
    }).isRequired,
  }).isRequired,
  feed: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { FeedImportDialog };

export default createFragmentContainer(withSetFlashMessage(injectIntl(FeedImportDialog)), graphql`
  fragment FeedImportDialog_team on Team {
    dbid
  }
  fragment FeedImportDialog_cluster on Cluster {
    media_count
    center {
      dbid
    }
    project_medias(first: 1) {
      edges {
        node {
          dbid
          title
          last_seen
          requests_count
          description
          media {
            ...SmallMediaCard_media
          }
        }
      }
    }
  }
  fragment FeedImportDialog_feed on Feed {
    dbid
  }
`);
