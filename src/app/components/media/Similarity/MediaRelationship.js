import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withSetFlashMessage } from '../../FlashMessage';
import MediaAndRequestsDialogComponent from '../../cds/menus-lists-dialogs/MediaAndRequestsDialogComponent';
import RemoveCircleOutlineIcon from '../../../icons/cancel.svg';
import IconMoreVert from '../../../icons/more_vert.svg';
import MediaSlug from '../MediaSlug';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SmallMediaCard from '../../cds/media-cards/SmallMediaCard';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../../helpers';

const useStyles = makeStyles(() => ({
  outer: {
    position: 'relative',
    cursor: 'pointer',
  },
  inner: {
    position: 'absolute',
    top: '8px',
    right: '8px',
  },
}));

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
  setFlashMessage,
  id,
  sourceId,
  targetId,
  mainProjectMedia,
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
        id="mediaItem.pinning"
        defaultMessage="Pinning…"
        description="Message displayed while action of pinning an item is being processed by the server. Same as defining an item as the main item"
      />,
      'info',
    );

    commitPinMutation(id, targetId, sourceId, (response, error) => {
      if (error) {
        handleError();
      } else {
        setFlashMessage((
          <FormattedMessage
            id="mediaItem.doneRedirecting"
            defaultMessage="Done, redirecting to new main item…"
            description="A message that informs the user a 'pin' action is finished and a redirect is about to happen"
          />
        ), 'success');
        browserHistory.push(`/${teamSlug}/media/${targetId}`);
      }
    },
    () => {
      handleError();
    });
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
              id="mediaItem.detachedSuccessfully"
              defaultMessage="Item detached"
              description="Banner displayed after items are detached successfully"
            />
          );
          setFlashMessage(message, 'success');
        }
      },
      onError: handleError,
    });
  };

  return (
    <>
      { canDelete && canSwitch ? (
        <Box>
          <ButtonMain
            iconCenter={<IconMoreVert />}
            onClick={handleOpenMenu}
            className="media-similarity__menu-icon"
            size="small"
            variant="contained"
            theme="text"
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
                    id="mediaItem.pinAsMain"
                    defaultMessage="Pin to the top"
                    description="Menu option for pinning an item as the main item"
                  />
                }
              />
            </MenuItem>
            <MenuItem onClick={event => swallowClick(event, handleDelete)}>
              <ListItemText
                className="similarity-media-item__delete-relationship"
                primary={
                  <FormattedMessage id="mediaItem.detach" defaultMessage="Detach media" description="Label for a button that lets the user set the media item they are clicking to be _not_ matched to its parent media item." />
                }
              />
            </MenuItem>
          </Menu>
        </Box>) : null
      }
      { canDelete && !canSwitch ?
        <Box>
          <IconButton onClick={event => swallowClick(event, handleDelete)}>
            <RemoveCircleOutlineIcon className="related-media-item__delete-relationship" />
          </IconButton>
        </Box> : null }
    </>
  );
};

const MediaRelationship = ({
  relationship,
  relationshipSourceId,
  relationshipTargetId,
  canSwitch,
  canDelete,
  mainProjectMediaId,
  mainProjectMediaDemand,
  mainProjectMediaConfirmedSimilarCount,
  superAdminMask,
  setFlashMessage,
  intl,
}) => {
  const classes = useStyles();
  const [isSelected, setIsSelected] = React.useState(false);

  const swallowClick = (ev) => {
    // Don't close Dialog when clicking on it
    ev.stopPropagation();
  };

  const details = [
    <FormattedMessage
      id="mediaRelationship.lastSubmitted"
      defaultMessage="Last submitted {date}"
      description="Shows the last time a media was submitted"
      values={{
        date: intl.formatDate(+relationship?.target?.last_seen * 1000, { year: 'numeric', month: 'short', day: '2-digit' }),
      }}
    />,
    <FormattedMessage
      id="mediaSuggestions.requestsCount"
      defaultMessage="{requestsCount, plural, one {# request} other {# requests}}"
      description="Header of requests list. Example: 26 requests"
      values={{ requestsCount: relationship?.target?.requests_count }}
    />,
  ];

  const maskContent = relationship?.target?.show_warning_cover;

  return (
    <div className={`${classes.outer} media__relationship`} >
      { isSelected ?
        <MediaAndRequestsDialogComponent
          projectMediaId={relationship.target_id}
          mediaSlug={
            <MediaSlug
              mediaType={relationship?.target?.type}
              slug={relationship.target?.title}
              details={details}
            />
          }
          onClick={swallowClick}
          onClose={() => setIsSelected(false)}
        /> : null }
      <SmallMediaCard
        key={relationship.id}
        customTitle={relationship?.target?.title}
        details={details}
        media={relationship?.target?.media}
        description={relationship?.target?.description}
        maskContent={maskContent}
        superAdminMask={superAdminMask}
        onClick={() => setIsSelected(true)}
      />
      <div className={`${classes.inner} media__relationship__menu`}>
        <RelationshipMenu
          canDelete={canDelete}
          canSwitch={canSwitch}
          id={relationship.id}
          sourceId={relationshipSourceId}
          targetId={relationshipTargetId}
          setFlashMessage={setFlashMessage}
          mainProjectMedia={{
            id: mainProjectMediaId,
            confirmedSimilarCount: mainProjectMediaConfirmedSimilarCount,
            demand: mainProjectMediaDemand,
          }}
        />
      </div>
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
