import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { commitMutation, graphql, createFragmentContainer } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import { withSetFlashMessage } from '../../FlashMessage';
import MediaAndRequestsDialogComponent from '../../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import ClearIcon from '../../../icons/clear.svg';
import PushPinIcon from '../../../icons/push_pin.svg';
import IconMoreVert from '../../../icons/more_vert.svg';
import RejectIcon from '../../../icons/cancel.svg';
import MediaSlug from '../MediaSlug';
import MediaFeedInformation from '../MediaFeedInformation';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SmallMediaCard from '../../cds/media-cards/SmallMediaCard';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../../helpers';
import MediaIdentifier from '../../cds/media-cards/MediaIdentifier';
import LastRequestDate from '../../cds/media-cards/LastRequestDate';
import RequestsCount from '../../cds/media-cards/RequestsCount';
import MediaOrigin from '../MediaOrigin';
import MediaOriginBanner from '../MediaOriginBanner';
import styles from '../media.module.css';
import similarityStyles from './MediaSimilarities.module.css';

const commitPinMutation = (id, targetId, sourceId, onCompleted, onError) => {
  const mutation = graphql`
    mutation MediaRelationshipUpdateRelationshipMutation($input: UpdateRelationshipInput!) {
      updateRelationship(input: $input) {
        relationship {
          id
        }
      }
    }
  `;

  commitMutation(Store, {
    mutation,
    variables: {
      input: {
        id,
        source_id: targetId,
        target_id: sourceId,
      },
    },
    onCompleted,
    onError,
  });
};

const RelationshipMenu = ({
  canDelete,
  canSwitch,
  id,
  mainProjectMedia,
  setFlashMessage,
  sourceId,
  targetId,
}) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const [anchorEl, setAnchorEl] = React.useState(null);

  const swallowClick = (event, callback) => {
    event.stopPropagation();
    callback();
  };

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleError = (error) => {
    const message = getErrorMessage(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
  };

  const handleSwitch = () => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Pinning…"
        description="Message displayed while action of pinning an item is being processed by the server. Same as defining an item as the main item"
        id="mediaItem.pinning"
      />,
      'info',
    );

    commitPinMutation(id, targetId, sourceId, (response, error) => {
      if (error) {
        handleError();
      } else {
        setFlashMessage((
          <FormattedMessage
            defaultMessage="Done, redirecting to new main item…"
            description="A message that informs the user a 'pin' action is finished and a redirect is about to happen"
            id="mediaItem.doneRedirecting"
          />
        ), 'success');
        browserHistory.push(`/${teamSlug}/media/${targetId}`);
      }
    },
    handleError,
    );
  };

  const handleDelete = () => {
    const mutation = graphql`
      mutation MediaRelationshipDestroyRelationshipMutation($input: DestroyRelationshipInput!) {
        destroyRelationship(input: $input) {
          deletedId
          source_project_media {
            id
            demand
            hasMain: is_confirmed_similar_to_another_item
            confirmedSimilarCount: confirmed_similar_items_count
            default_relationships_count
          }
          target_project_media {
            id
            demand
            is_suggested
            hasMain: is_confirmed_similar_to_another_item
            confirmedSimilarCount: confirmed_similar_items_count
            default_relationships_count
          }
        }
      }
    `;

    const optimisticResponse = {
      destroyRelationship: {
        deletedId: id,
        source_project_media: {
          id: mainProjectMedia.id,
          demand: mainProjectMedia.demand - 1,
          confirmed_similar_items_count: mainProjectMedia.confirmedSimilarCount - 1,
        },
      },
    };

    commitMutation(Store, {
      mutation,
      optimisticResponse,
      variables: {
        input: {
          id,
        },
      },
      configs: [
        {
          type: 'NODE_DELETE',
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: mainProjectMedia.id,
          pathToConnection: ['source_project_media', 'confirmed_similar_relationships'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: mainProjectMedia.id,
          pathToConnection: ['source_project_media', 'default_relationships'],
          deletedIDFieldName: 'deletedId',
        },
        {
          type: 'RANGE_DELETE',
          parentID: mainProjectMedia.id,
          pathToConnection: ['target_project_media', 'default_relationships'],
          deletedIDFieldName: 'deletedId',
        },
      ],
      onCompleted: (response, error) => {
        if (error) {
          handleError(error);
        } else {
          const message = (
            <FormattedMessage
              defaultMessage="Item detached"
              description="Banner displayed after items are detached successfully"
              id="mediaItem.detachedSuccessfully"
            />
          );
          setFlashMessage(message, 'success');
        }
      },
      onError: handleError,
    });
  };

  return (
    <div className={similarityStyles['similar-matched-media-options']}>
      { canDelete && canSwitch ? (
        <>
          <ButtonMain
            className="media-similarity__menu-icon"
            iconCenter={<IconMoreVert />}
            size="small"
            theme="text"
            variant="contained"
            onClick={handleOpenMenu}
          />
          <Menu
            anchorEl={anchorEl}
            className={styles.mediaMenuList}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem className={styles.mediaMenuItem} onClick={event => swallowClick(event, handleSwitch)}>
              <ListItemIcon className={styles.mediaMenuIcon}>
                <PushPinIcon />
              </ListItemIcon>
              <ListItemText
                className="similarity-media-item__pin-relationship"
                primary={
                  <FormattedMessage
                    defaultMessage="Pin this media to the top of the cluster"
                    description="Menu option for pinning an item as the main item"
                    id="mediaItem.pinAsMain"
                  />
                }
              />
            </MenuItem>
            <MenuItem className={styles.mediaMenuItem} onClick={event => swallowClick(event, handleDelete)}>
              <ListItemIcon className={styles.mediaMenuIcon}>
                <RejectIcon />
              </ListItemIcon>
              <ListItemText
                className="similarity-media-item__delete-relationship"
                primary={
                  <FormattedMessage
                    defaultMessage="Reject this media from the cluster"
                    description="Label for a button that lets the user set the media item they are clicking to be _not_ matched to its parent media item."
                    id="mediaItem.detach"
                  />
                }
              />
            </MenuItem>
          </Menu>
        </>) : null
      }
      { canDelete && !canSwitch ?
        <ButtonMain
          className="related-media-item__delete-relationship"
          iconCenter={<ClearIcon />}
          size="small"
          theme="text"
          variant="contained"
          onClick={event => swallowClick(event, handleDelete)}
        /> : null
      }
    </div>
  );
};

const MediaRelationship = ({
  canDelete,
  canSwitch,
  mainProjectMediaConfirmedSimilarCount,
  mainProjectMediaDemand,
  mainProjectMediaId,
  relationship,
  setFlashMessage,
}) => {
  const [isSelected, setIsSelected] = React.useState(false);

  const swallowClick = (ev) => {
    // Don't close Dialog when clicking on it
    ev.stopPropagation();
  };

  const details = [(
    <LastRequestDate
      lastRequestDate={(+relationship?.target?.last_seen * 1000) || +relationship?.target?.created_at * 1000}
      theme="lightText"
      variant="text"
    />
  ), (
    <RequestsCount
      requestsCount={relationship?.target?.requests_count}
      theme="lightText"
      variant="text"
    />
  ), (
    <MediaIdentifier
      mediaType={relationship?.target?.type}
      slug={relationship?.target?.media_slug || relationship?.target?.title}
      theme="lightText"
      variant="text"
    />
  ), (
    relationship?.target.media_cluster_origin_user?.name ? (
      <MediaOrigin
        projectMedia={relationship?.target}
      />
    ) : null
  )];

  const maskContent = relationship?.target?.show_warning_cover;

  return (
    <div className={cx('media__relationship', similarityStyles['similar-matched-media'])} >
      { isSelected ?
        <MediaAndRequestsDialogComponent
          dialogTitle={relationship?.target?.media.metadata?.title || relationship?.target?.media.quote || relationship?.target?.description}
          feedId={relationship?.target?.imported_from_feed_id}
          mediaHeader={<MediaFeedInformation projectMedia={relationship?.target} />}
          mediaOriginBanner={
            <MediaOriginBanner
              projectMedia={relationship?.target}
            />
          }
          mediaSlug={
            <MediaSlug
              className={styles['media-slug-title']}
              details={details}
            />
          }
          projectMediaId={relationship.target_id}
          projectMediaImportedId={relationship?.target?.imported_from_project_media_id}
          onClick={swallowClick}
          onClose={() => setIsSelected(false)}
        /> : null }
      {
        relationship?.target && (
          <SmallMediaCard
            description={relationship?.target?.description}
            details={details}
            key={relationship.id}
            maskContent={maskContent}
            media={relationship?.target?.media}
            onClick={() => setIsSelected(true)}
          />
        )
      }
      <RelationshipMenu
        canDelete={canDelete}
        canSwitch={canSwitch}
        id={relationship.id}
        mainProjectMedia={{
          id: mainProjectMediaId,
          confirmedSimilarCount: mainProjectMediaConfirmedSimilarCount,
          demand: mainProjectMediaDemand,
        }}
        setFlashMessage={setFlashMessage}
        sourceId={relationship?.source_id}
        targetId={relationship?.target_id}
      />
    </div>
  );
};

MediaRelationship.propTypes = {
  canDelete: PropTypes.bool.isRequired,
  canSwitch: PropTypes.bool.isRequired,
  mainProjectMediaConfirmedSimilarCount: PropTypes.number.isRequired,
  mainProjectMediaDemand: PropTypes.number.isRequired,
  mainProjectMediaId: PropTypes.string.isRequired,
  relationship: PropTypes.object.isRequired,
};

export default createFragmentContainer(withSetFlashMessage(injectIntl(MediaRelationship)), graphql`
  fragment MediaRelationship_relationship on Relationship {
    source_id
    target_id
    id
    target {
      id
      media_slug
      title
      description
      type
      last_seen
      created_at
      show_warning_cover
      quote
      imported_from_feed_id
      requests_count
      media_cluster_origin_user {
        name
      }
      media {
        ...SmallMediaCard_media
      }
      ...MediaFeedInformation_projectMedia
      ...MediaOrigin_projectMedia
      ...MediaOriginBanner_projectMedia
    }
  }
`);

