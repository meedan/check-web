/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { Dialog } from '@material-ui/core';
import { browserHistory } from 'react-router';
import { can } from '../../Can';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import MediaAndRequestsDialogComponent from '../../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import SmallMediaCard from '../../cds/media-cards/SmallMediaCard';
import MediaSlug from '../MediaSlug';
import Loader from '../../cds/loading/Loader';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { withSetFlashMessage } from '../../FlashMessage';
import CheckArchivedFlags from '../../../CheckArchivedFlags';
import { getErrorMessageForRelayModernProblem } from '../../../helpers';
import BulkArchiveProjectMediaMutation from '../../../relay/mutations/BulkArchiveProjectMediaMutation';
import AcceptIcon from '../../../icons/check_circle.svg';
import RejectIcon from '../../../icons/cancel.svg';
import SpamIcon from '../../../icons/report.svg';
import TrashIcon from '../../../icons/delete.svg';
import NextIcon from '../../../icons/chevron_right.svg';
import PreviousIcon from '../../../icons/chevron_left.svg';
import inputStyles from '../../../styles/css/inputs.module.css';
import dialogStyles from '../../../styles/css/dialog.module.css';
import styles from '../media.module.css';
import suggestionsStyles from './MediaSuggestions.module.css';

const MediaSuggestionsComponent = ({
  intl,
  mainItem,
  pageSize,
  relationships,
  relay,
  reportType,
  setFlashMessage,
  superAdminMask,
  team,
  totalCount,
}) => {
  const [selectedItemId, setSelectedItemId] = React.useState(0);
  const [isBulkRejectDialogOpen, setIsBulkRejectDialogOpen] = React.useState(false);
  const [isBulkSpamDialogOpen, setIsBulkSpamDialogOpen] = React.useState(false);
  const [isBulkTrashDialogOpen, setIsBulkTrashDialogOpen] = React.useState(false);
  const [isBulkAcceptDialogOpen, setIsBulkAcceptDialogOpen] = React.useState(false);
  const [isMutationPending, setIsMutationPending] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);
  const openBulkRejectDialog = React.useCallback(() => setIsBulkRejectDialogOpen(true), [setIsBulkRejectDialogOpen]);
  const closeBulkRejectDialog = React.useCallback(() => setIsBulkRejectDialogOpen(false), [setIsBulkRejectDialogOpen]);
  const openBulkAcceptDialog = React.useCallback(() => setIsBulkAcceptDialogOpen(true), [setIsBulkAcceptDialogOpen]);
  const closeBulkAcceptDialog = React.useCallback(() => setIsBulkAcceptDialogOpen(false), [setIsBulkAcceptDialogOpen]);
  const openBulkSpamDialog = React.useCallback(() => setIsBulkSpamDialogOpen(true), [setIsBulkSpamDialogOpen]);
  const closeBulkSpamDialog = React.useCallback(() => setIsBulkSpamDialogOpen(false), [setIsBulkSpamDialogOpen]);
  const openBulkTrashDialog = React.useCallback(() => setIsBulkTrashDialogOpen(true), [setIsBulkTrashDialogOpen]);
  const closeBulkTrashDialog = React.useCallback(() => setIsBulkTrashDialogOpen(false), [setIsBulkTrashDialogOpen]);

  const swallowClick = (event) => {
    event.stopPropagation();
  };

  const handleCompleted = () => {
    setIsMutationPending(false);
    const message = (
      <FormattedMessage
        defaultMessage="Suggestion updated successfully"
        description="Banner displayed after items are accepted or rejected successfully"
        id="mediaSuggestionsComponent.updatedSuccessfully"
      />
    );
    setFlashMessage(message, 'success');
  };

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
    setIsMutationPending(false);
    setFlashMessage(errorMessage, 'error');
  };

  const handleReplace = (relationship) => {
    const mutation = graphql`
      mutation MediaSuggestionsComponentReplaceProjectMediaMutation($input: ReplaceProjectMediaInput!) {
        replaceProjectMedia(input: $input) {
          new_project_media {
            dbid
          }
        }
      }
    `;
    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          skip_send_report: true,
          project_media_to_be_replaced_id: mainItem.id,
          new_project_media_id: relationship.target?.id,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          const projectMediaDbid = relationship.target_id;
          const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
          const newPath = `/${teamSlug}/media/${projectMediaDbid}`;
          window.location.href = window.location.href.replace(window.location.pathname, newPath);
        }
      },
      onError: onFailure,
    });
  };

  const destroyMutation = graphql`
    mutation MediaSuggestionsComponentDestroyRelationshipMutation($input: DestroyRelationshipInput!, $rejection: Boolean!, $totalLoaded: Int) {
      destroyRelationship(input: $input) {
        deletedId
        source_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          suggested_similar_relationships(first: $totalLoaded) {
            edges {
              node {
                id
                target_id
              }
            }
            totalCount
          }
        }
        target_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          is_suggested
          suggested_similar_relationships(first: $totalLoaded) {
            edges {
              node {
                id
                target_id
              }
            }
            totalCount
          }
        }
      }
    }
  `;

  const handleDestroyAndReplace = (relationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: false,
        input: {
          id: relationship.id,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          handleReplace(relationship);
        }
      },
      onError: onFailure,
    });
  };

  const destroyBulkMutation = graphql`
    mutation MediaSuggestionsComponentDestroyRelationshipsMutation($input: DestroyRelationshipsInput!, $rejection: Boolean!, $totalLoaded: Int) {
      destroyRelationships(input: $input) {
        ids
        source_project_media @include(if: $rejection) {
          hasMain: is_confirmed_similar_to_another_item
          suggestionsCount: suggested_similar_items_count
          confirmedSimilarCount: confirmed_similar_items_count
          suggested_similar_relationships(first: $totalLoaded) {
            edges {
              node {
                id
                target_id
              }
            }
            totalCount
          }
        }
      }
    }
  `;

  const handleBulkReject = (targetProject, disableFlashMessage, callback = () => {}) => {
    setIsBulkRejectDialogOpen(false);
    const visibleItemIds = relationships.slice(cursor, cursor + pageSize).map(relationship => relationship.id);

    commitMutation(Store, {
      mutation: destroyBulkMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: true,
        input: {
          ids: visibleItemIds,
          source_id: mainItem.dbid,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          return onFailure(error);
        }
        const message = (
          <FormattedMessage
            defaultMessage="{number} media rejected"
            description="Title that appears in a popup to confirm that a 'bulk reject' action was successful"
            id="mediaSuggestionsComponent.flashBulkRejectTitle"
            values={{
              number: visibleItemIds.length,
            }}
          />
        );
        if (!disableFlashMessage) {
          setFlashMessage(message, 'success');
        }
        return callback();
      },
      onError: onFailure,
    });
  };

  const handleBulkConfirm = () => {
    const mutation = graphql`
      mutation MediaSuggestionsComponentUpdateRelationshipsMutation($input: UpdateRelationshipsInput!, $totalLoaded: Int) {
        updateRelationships(input: $input) {
          source_project_media {
            demand
            requests_count
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
            suggested_similar_relationships(first: $totalLoaded) {
              edges {
                node {
                  id
                  target_id
                }
              }
              totalCount
            }
            confirmed_similar_relationships(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  source_id
                  target_id
                  target {
                    id
                    dbid
                    title
                    picture
                    created_at
                    type
                    requests_count
                  }
                }
              }
            }
          }
        }
      }
    `;

    setIsMutationPending(true);
    const visibleItemIds = relationships.slice(cursor, cursor + pageSize).map(relationship => relationship.id);

    commitMutation(Store, {
      mutation,
      variables: {
        totalLoaded: relationships.length,
        input: {
          ids: visibleItemIds,
          source_id: mainItem.dbid,
          action: 'accept',
        },
      },
      onCompleted: ({ error, response }) => {
        if (error) {
          return onFailure(error);
        }
        const message = (
          <FormattedMessage
            defaultMessage="{number} suggested media matched"
            description="Title that appears in a popup to confirm that a 'bulk accept' action was successful"
            id="mediaSuggestionsComponent.flashBulkConfirmTitle"
            values={{
              number: visibleItemIds.length,
            }}
          />
        );
        closeBulkAcceptDialog();
        setFlashMessage(message, 'success');
        return handleCompleted(response);
      },
      onError: onFailure,
    });
  };

  const handleConfirm = (relationship) => {
    const relationship_type = 'confirmed_sibling';

    const mutation = graphql`
      mutation MediaSuggestionsComponentUpdateRelationshipMutation($input: UpdateRelationshipInput!, $totalLoaded: Int) {
        updateRelationship(input: $input) {
          relationship {
            relationship_type
          }
          source_project_media {
            demand
            requests_count
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
            suggested_similar_relationships(first: $totalLoaded) {
              edges {
                node {
                  id
                  target_id
                }
              }
              totalCount
            }
            confirmed_similar_relationships(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  source_id
                  target_id
                  target {
                    id
                    dbid
                    title
                    picture
                    created_at
                    type
                    requests_count
                  }
                }
              }
            }
          }
          target_project_media {
            demand
            requests_count
            added_as_similar_by_name
            confirmed_as_similar_by_name
            hasMain: is_confirmed_similar_to_another_item
            suggestionsCount: suggested_similar_items_count
            confirmedSimilarCount: confirmed_similar_items_count
            suggested_similar_relationships(first: $totalLoaded) {
              edges {
                node {
                  id
                  target_id
                }
              }
              totalCount
            }
          }
        }
      }
    `;

    setIsMutationPending(true);
    commitMutation(Store, {
      mutation,
      variables: {
        totalLoaded: relationships.length,
        input: {
          id: relationship.id,
          relationship_source_type: relationship_type,
          relationship_target_type: relationship_type,
        },
      },
      onCompleted: ({ error, response }) => {
        if (error) {
          return onFailure(error);
        }
        return handleCompleted(response);
      },
      onError: onFailure,
    });
  };

  const handleReject = (selectedRelationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: true,
        input: {
          id: selectedRelationship.id,
        },
      },
      onCompleted: ({ error, response }) => {
        if (error) {
          return onFailure(error);
        }
        return handleCompleted(response);
      },
      onError: onFailure,
    });
  };

  const handleBulkArchiveTarget = (archived) => {
    const visibleItemIds = relationships.slice(cursor, cursor + pageSize).map(relationship => relationship.target?.id);

    const mutation = new BulkArchiveProjectMediaMutation({
      ids: visibleItemIds,
      archived,
      team,
    });

    // reject these items and send them to trash or spam
    handleBulkReject({ dbid: null }, true, () => {
      // after rejecting, send to spam
      Store.commitUpdate(mutation, {
        onSuccess: () => {
          const message = archived === CheckArchivedFlags.TRASHED ? (
            <FormattedMessage
              defaultMessage="{number} media sent to the trash"
              description="Text that appears in a popup to confirm that a 'bulk move to trash' action was successful"
              id="mediaSuggestionsComponent.flashBulkTrash"
              values={{
                number: visibleItemIds.length,
              }}
            />
          ) : (
            <FormattedMessage
              defaultMessage="{number} media marked as spam"
              description="Text that appears in a popup to confirm that a 'bulk move to spam' action was successful"
              id="mediaSuggestionsComponent.flashBulkSpam"
              values={{
                number: visibleItemIds.length,
              }}
            />
          );
          setFlashMessage(message, 'success');
          if (archived === CheckArchivedFlags.TRASHED) {
            closeBulkTrashDialog();
          } else {
            closeBulkSpamDialog();
          }
          setIsMutationPending(false);
        },
      });
    });
  };

  const handleArchiveTarget = (archived, relationship) => {
    commitMutation(Store, {
      mutation: destroyMutation,
      variables: {
        totalLoaded: relationships.length,
        rejection: true,
        input: {
          id: relationship.id,
          archive_target: archived,
        },
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          const message = archived === CheckArchivedFlags.TRASHED ? (
            <FormattedMessage
              defaultMessage="The item was moved to {trash}"
              description="Text that appears in a popup to confirmt hat a 'move to trash' action was successful"
              id="mediaSuggestionsComponent.movedToTrash"
              values={{
                trash: (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
                  <a id="int-media-suggestion-toast__link--trash" onClick={() => browserHistory.push(`/${team.slug}/trash`)}>
                    <FormattedMessage defaultMessage="Trash" description="Label on a link that, when clicked, takes the user to a list of trashed (marked for deletion) items" id="mediaDetail.trash" />
                  </a>
                ),
              }}
            />
          ) : (
            <FormattedMessage
              defaultMessage="The item was moved to {spam}"
              description="Text that appears in a popup to confirmt hat a 'move to spam' action was successful"
              id="mediaSuggestionsComponent.movedToSpam"
              values={{
                spam: (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
                  <a id="int-media-suggestion-toast__link--spam" onClick={() => browserHistory.push(`/${team.slug}/spam`)}>
                    <FormattedMessage defaultMessage="Spam" description="Label on a link that, when clicked, takes the user to a list of items marked as spam" id="mediaDetail.spam" />
                  </a>
                ),
              }}
            />
          );
          setFlashMessage(message, 'success');
        }
      },
      onError: onFailure,
    });
  };

  const disableAcceptRejectButtons = totalCount === 0 || !can(team.permissions, 'update Relationship') || isMutationPending;

  if (totalCount === 0) {
    return (
      <div className={cx('media__suggestions-column', styles['media-suggestions'], styles['media-item-content'])}>
        <div className={cx(styles['empty-list'], 'similarity-media-no-items')}>
          <FormattedMessage
            defaultMessage="{total, plural, one {{total} Suggestion} other {{total} Suggestions}}"
            description="A header that tells the user there are no items in the list"
            id="mediaSuggestionsComponent.noItems"
            values={{
              total: 0,
            }}
          />
        </div>
      </div>
    );
  }

  const RelationshipItem = ({ details, relationshipItem }) => (
    <div className={cx('suggested-media__item', suggestionsStyles['suggestions-item'])}>
      <div className={suggestionsStyles['suggestions-item-content']}>
        {
          relationshipItem?.target && (
            <SmallMediaCard
              customTitle={relationshipItem?.target?.title}
              description={relationshipItem?.target?.description}
              details={details}
              maskContent={relationshipItem?.target?.show_warning_cover}
              media={relationshipItem?.target?.media}
              superAdminMask={superAdminMask}
              onClick={() => setSelectedItemId(relationshipItem?.target?.dbid)}
            />
          )
        }
        { selectedItemId === relationshipItem?.target_id ?
          <MediaAndRequestsDialogComponent
            mediaSlug={
              <MediaSlug
                className={styles['media-slug-title']}
                details={details}
                mediaType={relationshipItem?.target?.type}
                slug={relationshipItem?.target?.title}
              />
            }
            projectMediaId={selectedItemId}
            onClick={swallowClick}
            onClose={() => setSelectedItemId(null)}
          />
          : null }
      </div>
      <div className={suggestionsStyles['suggestions-item-actions']}>
        <Tooltip arrow title={<FormattedMessage defaultMessage="Match media" description="Tooltip for a button that is a green check mark. Pressing this button causes the media item next to the button to be accepted as a matched item, and removed from the suggested items list." id="mediaSuggestionsComponent.accept" />}>
          <span>
            <ButtonMain
              className="similarity-media-item__accept-relationship"
              customStyle={relationshipItem?.target?.media ? {} : { display: 'none' }}
              disabled={disableAcceptRejectButtons}
              iconCenter={<AcceptIcon />}
              size="default"
              theme="lightValidation"
              variant="text"
              onClick={reportType === 'blank' ? () => { handleDestroyAndReplace(relationshipItem); } : () => { handleConfirm(relationshipItem); }}
            />
          </span>
        </Tooltip>
        <Tooltip arrow title={<FormattedMessage defaultMessage="Reject media" description="Tooltip for a button that is a red X mark. Pressing this button causes the media item next to the button to be rejected as a matched item, and removed from the suggested items list." id="mediaSuggestionsComponent.reject" />}>
          <span>
            <ButtonMain
              className="similarity-media-item__reject-relationship"
              customStyle={relationshipItem?.target?.media ? {} : { display: 'none' }}
              disabled={disableAcceptRejectButtons}
              iconCenter={<RejectIcon />}
              size="default"
              theme="lightError"
              variant="text"
              onClick={() => {
                handleReject(relationshipItem);
              }}
            />
          </span>
        </Tooltip>
        <Tooltip arrow title={<FormattedMessage defaultMessage="Mark media as spam" description="Tooltip for a button that is an octogon with an exclamation mark. Pressing this button causes the media item next to the button to be marked as spam, and removed from the suggested items list." id="mediaSuggestionsComponent.spam" />}>
          <span>
            <ButtonMain
              customStyle={relationshipItem?.target?.media ? {} : { display: 'none' }}
              disabled={disableAcceptRejectButtons}
              iconCenter={<SpamIcon />}
              size="default"
              theme="lightAlert"
              variant="text"
              onClick={() => handleArchiveTarget(CheckArchivedFlags.SPAM, relationshipItem)}
            />
          </span>
        </Tooltip>
        <Tooltip arrow title={<FormattedMessage defaultMessage="Send media to trash" description="Tooltip for a button that is a waste bin. Pressing this button causes the media item next to the button to be sent to the trash  and removed from the suggested items list." id="mediaSuggestionsComponent.trash" />}>
          <span>
            <ButtonMain
              customStyle={relationshipItem?.target?.media ? {} : { display: 'none' }}
              disabled={disableAcceptRejectButtons}
              iconCenter={<TrashIcon />}
              size="default"
              theme="lightBeige"
              variant="text"
              onClick={() => handleArchiveTarget(CheckArchivedFlags.TRASHED, relationshipItem)}
            />
          </span>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      <div className={cx('media__suggestions-column', styles['media-suggestions'], styles['media-item-content'])}>
        { relationships.length > 0 &&
          <>
            <div className={cx(suggestionsStyles['suggestions-bulk-actions-wrapper'], inputStyles['form-inner-wrapper'])}>
              <div className={suggestionsStyles['suggestions-bulk-actions']}>
                <Tooltip arrow title={<FormattedMessage defaultMessage="Match all media on this page" description="Tooltip for a button that is a green check mark. Pressing it causes all visible media items on the page to be confirmed as matched media." id="mediaSuggestionsComponent.bulkAccept" />}>
                  <span>
                    <ButtonMain
                      disabled={disableAcceptRejectButtons}
                      iconCenter={<AcceptIcon />}
                      size="default"
                      theme="validation"
                      variant="text"
                      onClick={() => openBulkAcceptDialog()}
                    />
                  </span>
                </Tooltip>
                <Tooltip arrow title={<FormattedMessage defaultMessage="Reject all media on this page" description="Tooltip for a button that is a red X mark. Pressing it causes all visible media items on the page to be rejected and removed from the suggestions list." id="mediaSuggestionsComponent.bulkReject" />}>
                  <span>
                    <ButtonMain
                      disabled={disableAcceptRejectButtons}
                      iconCenter={<RejectIcon />}
                      size="default"
                      theme="error"
                      variant="text"
                      onClick={() => openBulkRejectDialog()}
                    />
                  </span>
                </Tooltip>
                <Tooltip arrow title={<FormattedMessage defaultMessage="Mark all media on this page as spam" description="Tooltip for a button that is an octagon with an exclamation mark. Pressing this button causes all visible media items on the page to be marked as 'spam' and removed from the suggestions list." id="mediaSuggestionsComponent.bulkSpam" />}>
                  <span>
                    <ButtonMain
                      disabled={disableAcceptRejectButtons}
                      iconCenter={<SpamIcon />}
                      size="default"
                      theme="lightAlert"
                      variant="text"
                      onClick={() => openBulkSpamDialog()}
                    />
                  </span>
                </Tooltip>
                <Tooltip arrow title={<FormattedMessage defaultMessage="Send all media on this page to trash" description="Tooltip for a button that is a trash bin. Pressing this button causes all visible media items on the page to be sent to the 'trash' and removed from the suggestions list." id="mediaSuggestionsComponent.bulkTrash" />}>
                  <span>
                    <ButtonMain
                      disabled={disableAcceptRejectButtons}
                      iconCenter={<TrashIcon />}
                      size="default"
                      theme="lightBeige"
                      variant="text"
                      onClick={() => openBulkTrashDialog()}
                    />
                  </span>
                </Tooltip>
              </div>
              <div className={suggestionsStyles['suggestions-pagination']}>
                <Tooltip arrow title={<FormattedMessage defaultMessage="Previous" description="Label for the 'go to previous page' button on paginated suggestions" id="mediaSuggestionsComponent.previous" />}>
                  <span>
                    <ButtonMain
                      disabled={isPaginationLoading || cursor - pageSize < 0}
                      iconCenter={<PreviousIcon />}
                      size="default"
                      theme="lightText"
                      variant="text"
                      onClick={() => {
                        if (cursor - pageSize >= 0) {
                          setCursor(cursor - pageSize);
                        }
                      }}
                    />
                  </span>
                </Tooltip>
                <span className="typography-button">
                  <FormattedMessage
                    defaultMessage="{total, plural, one {1 / 1} other {{start} - {end} / #}}"
                    description="A header that tells the user how many suggestions items are in the list to follow"
                    id="mediaSuggestionsComponent.title"
                    values={{
                      total: totalCount,
                      start: cursor + 1,
                      end: Math.min(cursor + pageSize, totalCount),
                    }}
                  />
                </span>
                <Tooltip arrow title={<FormattedMessage defaultMessage="Next" description="Label for the 'go to next page' button on paginated suggestions" id="mediaSuggestionsComponent.next" />}>
                  <span>
                    <ButtonMain
                      disabled={isPaginationLoading || cursor + pageSize >= totalCount}
                      iconCenter={<NextIcon />}
                      size="default"
                      theme="lightText"
                      variant="text"
                      onClick={() => {
                        if (relay.hasMore() && !relay.isLoading() && (cursor + pageSize === relationships.length)) {
                          setIsPaginationLoading(true);
                          relay.loadMore(pageSize, () => {
                            setCursor(cursor + pageSize);
                            setIsPaginationLoading(false);
                          });
                        } else if (cursor + pageSize < relationships.length) {
                          setCursor(cursor + pageSize);
                        }
                      }}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>
            <Dialog
              className={dialogStyles['dialog-window']}
              fullWidth
              maxWidth="sm"
              open={isBulkAcceptDialogOpen}
              onClose={closeBulkAcceptDialog}
            >
              <div className={dialogStyles['dialog-title']}>
                <FormattedMessage
                  defaultMessage="Are you sure you want to match {number} suggestions?"
                  description="Prompt to a user when they choose to match media as a bulk action"
                  id="mediaSuggestionsComponent.dialogBulkAcceptTitle"
                  tagName="h6"
                  values={{
                    number: relationships.slice(cursor, cursor + pageSize).length,
                  }}
                />
              </div>
              <div className={dialogStyles['dialog-actions']}>
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Cancel"
                      description="Regular Cancel action label"
                      id="global.cancel"
                    />
                  }
                  size="default"
                  theme="text"
                  variant="text"
                  onClick={closeBulkAcceptDialog}
                />
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Match all"
                      description="Button that a user presses to confirm that they are going to match all visible suggested media"
                      id="mediaSuggestionsComponent.dialogBulkAcceptConfirm"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={handleBulkConfirm}
                />
              </div>
            </Dialog>
            <Dialog
              className={dialogStyles['dialog-window']}
              fullWidth
              maxWidth="sm"
              open={isBulkSpamDialogOpen}
              onClose={closeBulkSpamDialog}
            >
              <div className={dialogStyles['dialog-title']}>
                <FormattedMessage
                  defaultMessage="Are you sure you want to mark {number} suggested media as spam?"
                  description="Prompt to a user when they choose to mark media as spam in bulk"
                  id="mediaSuggestionsComponent.dialogBulkSpamTitle"
                  tagName="h6"
                  values={{
                    number: relationships.slice(cursor, cursor + pageSize).length,
                  }}
                />
              </div>
              <div className={dialogStyles['dialog-actions']}>
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Cancel"
                      description="Regular Cancel action label"
                      id="global.cancel"
                    />
                  }
                  size="default"
                  theme="text"
                  variant="text"
                  onClick={closeBulkSpamDialog}
                />
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Mark as spam"
                      description="Button that a user presses to confirm that they are going to mark all visible suggested media as spam"
                      id="mediaSuggestionsComponent.dialogBulkSpamConfirm"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={() => handleBulkArchiveTarget(CheckArchivedFlags.SPAM)}
                />
              </div>
            </Dialog>
            <Dialog
              className={dialogStyles['dialog-window']}
              fullWidth
              maxWidth="sm"
              open={isBulkTrashDialogOpen}
              onClose={closeBulkTrashDialog}
            >
              <div className={dialogStyles['dialog-title']}>
                <FormattedMessage
                  defaultMessage="Are you sure you want to send {number} suggestions to the trash?"
                  description="Prompt to a user when they choose to send media to trash in bulk"
                  id="mediaSuggestionsComponent.dialogBulkTrashTitle"
                  tagName="h6"
                  values={{
                    number: relationships.slice(cursor, cursor + pageSize).length,
                  }}
                />
              </div>
              <div className={dialogStyles['dialog-actions']}>
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Cancel"
                      description="Regular Cancel action label"
                      id="global.cancel"
                    />
                  }
                  size="default"
                  theme="text"
                  variant="text"
                  onClick={closeBulkTrashDialog}
                />
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Send to trash"
                      description="Button that a user presses to confirm that they are going to send all visible suggested media to trash"
                      id="mediaSuggestionsComponent.dialogBulkTrashConfirm"
                      values={{
                        number: relationships.slice(cursor, cursor + pageSize).length,
                      }}
                    />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={() => handleBulkArchiveTarget(CheckArchivedFlags.TRASHED)}
                />
              </div>
            </Dialog>
            <Dialog
              className={dialogStyles['dialog-window']}
              fullWidth
              maxWidth="sm"
              open={isBulkRejectDialogOpen}
              onClose={closeBulkRejectDialog}
            >
              <div className={dialogStyles['dialog-title']}>
                <FormattedMessage
                  defaultMessage="Are you sure you want to reject {number} suggestions?"
                  description="Prompt to a user when they choose to reject media in bulk"
                  id="mediaSuggestionsComponent.dialogBulkRejectTitle"
                  tagName="h6"
                  values={{
                    number: relationships.slice(cursor, cursor + pageSize).length,
                  }}
                />
              </div>
              <div className={dialogStyles['dialog-actions']}>
                <ButtonMain
                  label={<FormattedMessage
                    defaultMessage="Cancel"
                    description="Regular Cancel action label"
                    id="global.cancel"
                  />}
                  size="default"
                  theme="text"
                  variant="text"
                  onClick={closeBulkRejectDialog}
                />
                <ButtonMain
                  label={<FormattedMessage
                    defaultMessage="Reject"
                    description="Button that a user presses to confirm that they are going to reject all visible suggested media"
                    id="mediaSuggestionsComponent.dialogBulkRejectConfirm"
                    values={{
                      number: relationships.slice(cursor, cursor + pageSize).length,
                    }}
                  />}
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={() => handleBulkReject()}
                />
              </div>
            </Dialog>
          </>
        }
        <div id="suggested-media__items">
          { isPaginationLoading ?
            <Loader size="medium" theme="grey" variant="inline" /> :
            relationships
              .slice(cursor, cursor + pageSize)
              .map(relationshipItem => (
                <RelationshipItem
                  details={[
                    <FormattedMessage
                      defaultMessage="Last submitted {date}"
                      description="Shows the last time a media was submitted (on feed request media card)"
                      id="mediaSuggestions.lastSubmitted"
                      values={{
                        date: intl.formatDate(+relationshipItem?.target?.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
                      }}
                    />,
                    <FormattedMessage
                      defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
                      description="Header of requests list. Example: 26 requests"
                      id="mediaSuggestions.requestsCount"
                      values={{ requestsCount: relationshipItem?.target?.requests_count }}
                    />,
                  ]}
                  key={relationshipItem.target_id}
                  relationshipItem={relationshipItem}
                />
              ))}
        </div>
      </div>
    </React.Fragment>
  );
};

MediaSuggestionsComponent.propTypes = {
  mainItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  reportType: PropTypes.string.isRequired,
  relationships: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    target_id: PropTypes.number.isRequired,
  })).isRequired,
  relay: PropTypes.object.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string,
    smooch_bot: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  superAdminMask: PropTypes.bool,
};

MediaSuggestionsComponent.defaultProps = {
  superAdminMask: false,
};

// eslint-disable-next-line
export { MediaSuggestionsComponent as MediaSuggestionsComponentTest };
export default withSetFlashMessage(injectIntl(MediaSuggestionsComponent));
