/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { FormattedMessage, injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import { withSetFlashMessage } from '../../FlashMessage';
import MediaAndRequestsDialogComponent from '../../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import ClearIcon from '../../../icons/clear.svg';
import IconMoreVert from '../../../icons/more_vert.svg';
import MediaSlug from '../MediaSlug';
import MediaFeedInformation from '../MediaFeedInformation';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SmallMediaCard from '../../cds/media-cards/SmallMediaCard';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../../helpers';
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
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={event => swallowClick(event, handleSwitch)}>
              <ListItemText
                className="similarity-media-item__pin-relationship"
                primary={
                  <FormattedMessage
                    defaultMessage="Pin to the top"
                    description="Menu option for pinning an item as the main item"
                    id="mediaItem.pinAsMain"
                  />
                }
              />
            </MenuItem>
            <MenuItem onClick={event => swallowClick(event, handleDelete)}>
              <ListItemText
                className="similarity-media-item__delete-relationship"
                primary={
                  <FormattedMessage defaultMessage="Detach media" description="Label for a button that lets the user set the media item they are clicking to be _not_ matched to its parent media item." id="mediaItem.detach" />
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
  intl,
  mainProjectMediaConfirmedSimilarCount,
  mainProjectMediaDemand,
  mainProjectMediaId,
  relationship,
  relationshipSourceId,
  relationshipTargetId,
  setFlashMessage,
  superAdminMask,
}) => {
  const [isSelected, setIsSelected] = React.useState(false);

  const swallowClick = (ev) => {
    // Don't close Dialog when clicking on it
    ev.stopPropagation();
  };

  const details = [
    <FormattedMessage
      defaultMessage="Last submitted {date}"
      description="Shows the last time a media was submitted"
      id="mediaRelationship.lastSubmitted"
      values={{
        date: intl.formatDate(+relationship?.target?.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
      }}
    />,
    <FormattedMessage
      defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
      description="Header of requests list. Example: 26 requests"
      id="mediaSuggestions.requestsCount"
      values={{ requestsCount: relationship?.target?.requests_count }}
    />,
  ];

  const maskContent = relationship?.target?.show_warning_cover;

  return (
    <div className={cx('media__relationship', similarityStyles['similar-matched-media'])} >
      { isSelected ?
        <MediaAndRequestsDialogComponent
          feedId={relationship?.target?.imported_from_feed_id}
          mediaHeader={<MediaFeedInformation projectMedia={relationship?.target} />}
          mediaSlug={
            <MediaSlug
              className={styles['media-slug-title']}
              details={details}
              mediaType={relationship?.target?.type}
              slug={relationship.target?.title}
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
            customTitle={relationship?.target?.title}
            description={relationship?.target?.description}
            details={details}
            key={relationship.id}
            maskContent={maskContent}
            media={relationship?.target?.media}
            superAdminMask={superAdminMask}
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
        sourceId={relationshipSourceId}
        targetId={relationshipTargetId}
      />
    </div>
  );
};

MediaRelationship.propTypes = {
  relationship: PropTypes.object.isRequired,
  relationshipSourceId: PropTypes.number.isRequired,
  relationshipTargetId: PropTypes.number.isRequired,
  canSwitch: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  mainProjectMediaId: PropTypes.string.isRequired,
  mainProjectMediaDemand: PropTypes.number.isRequired,
  mainProjectMediaConfirmedSimilarCount: PropTypes.number.isRequired,
  superAdminMask: PropTypes.bool,
};

MediaRelationship.defaultProps = {
  superAdminMask: false,
};

export default withSetFlashMessage(injectIntl(MediaRelationship));
