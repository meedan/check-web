import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Relay from 'react-relay/classic';
import RCTooltip from 'rc-tooltip';
import styled from 'styled-components';
import 'react-image-lightbox/style.css';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddAnnotation from './AddAnnotation';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import SourcePicture from '../source/SourcePicture';
import ProfileLink from '../layout/ProfileLink';
import UserTooltip from '../user/UserTooltip';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import {
  getErrorMessage,
  parseStringUnixTimestamp,
} from '../../helpers';
import { stringHelper } from '../../customHelpers';
import {
  units,
  breakWordStyles,
  Row,
} from '../../styles/js/shared';
import MoreVertIcon from '../../icons/more_vert.svg';

const StyledAnnotationCardWrapper = styled.div`
  width: 100%;
  z-index: initial !important;

  img {
    cursor: pointer;
  }
`;

const StyledAvatarColumn = styled.div`
  margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(3)};
`;

const StyledPrimaryColumn = styled.div`
  flex: 1;

  .annotation__card-content {
    ${breakWordStyles}
    width: 100%;

    & > span:first-child {
      flex: 1;
    }
  }
`;

const StyledAnnotationWrapper = styled.section`
  .annotation__card-text {
    display: flex;
  }

  .annotation__timestamp {
    color: var(--textDisabled);
    display: inline;
    flex: 1;
    white-space: pre;
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)};
  }
`;

const StyledAnnotationMetadata = styled(Row)`
  color: var(--textSecondary);
  flex-flow: wrap row;

  .annotation__card-author {
    color: var(--textPrimary);
    padding-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)};
  }
`;

const StyledAnnotationActionsWrapper = styled.div`
  margin-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: auto;
`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = { editMode: false };
  }

  handleOpenMenu = (e) => {
    e.stopPropagation();
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleEdit = () => {
    this.setState({ editMode: true });
    this.handleCloseMenu();
  };

  handleCloseEdit = () => {
    this.setState({ editMode: false });
  };

  handleDelete(id) {
    const onSuccess = () => {};
    Relay.Store.commitUpdate(
      new DeleteAnnotationMutation({
        parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
        annotated: this.props.annotated,
        id,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  fail = (transaction) => {
    const message = getErrorMessage(
      transaction,
      (
        <FormattedMessage
          id="global.unknownError"
          defaultMessage="Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists."
          description="Message displayed in error notification when an operation fails unexpectedly"
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      ),
    );
    this.props.setFlashMessage(message, 'error');
  };

  render() {
    const { annotation, annotated } = this.props;
    let annotationActions = null;
    if (annotation && annotation.annotation_type) {
      const canUpdate = can(annotation.permissions, 'update Comment');
      const canDestroy = can(annotation.permissions, 'destroy Comment');
      const canDoAnnotationActions = canDestroy || canUpdate;
      annotationActions = canDoAnnotationActions ? (
        <div>
          <ButtonMain
            theme="text"
            size="small"
            variant="contained"
            iconCenter={<MoreVertIcon />}
            className="menu-button"
            onClick={this.handleOpenMenu}
          />
          <Menu
            id="customized-menu"
            anchorEl={this.state.anchorEl}
            keepMounted
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleCloseMenu}
          >
            {canUpdate ? (
              <MenuItem
                className="annotation__update"
                onClick={this.handleEdit}
              >
                <FormattedMessage id="annotation.editButton" defaultMessage="Edit" description="Menu item label to edit a comment" />
              </MenuItem>
            ) : null}
            {canDestroy ? (
              <MenuItem
                className="annotation__delete"
                onClick={this.handleDelete.bind(this, annotation.id)}
              >
                <FormattedMessage id="annotation.deleteButton" defaultMessage="Delete" description="Menu item label to delete a comment" />
              </MenuItem>
            ) : null}
            <MenuItem>
              <a
                href={`#annotation-${annotation.dbid}`}
                style={{ textDecoration: 'none', color: 'var(--textPrimary)' }}
              >
                <FormattedMessage
                  id="annotation.permalink"
                  defaultMessage="Permalink"
                  description="Menu item label to generate the permanent link for this comment"
                />
              </a>
            </MenuItem>
          </Menu>
        </div>)
        : null;
    }

    const createdAt = parseStringUnixTimestamp(annotation.created_at);

    const { user } = annotation.annotator;
    const authorName = user
      ? <ProfileLink className="annotation__author-name" teamUser={user.team_user} /> : null;

    const commentText = annotation.text;
    const commentContent = JSON.parse(annotation.content);
    const contentTemplate = (
      <div>
        <div className="annotation__card-content">
          <div>
            { this.state.editMode ?
              <AddAnnotation
                cmdText={commentText}
                editMode={this.state.editMode}
                handleCloseEdit={this.handleCloseEdit}
                annotated={annotated}
                annotation={annotation}
                annotatedType="ProjectMedia"
                types={['comment']}
              />
              : <ParsedText text={commentText} />
            }
          </div>
          {/* comment file */}
          {commentContent.file_path ?
            <div>
              <Box
                component="a"
                href={commentContent.file_path}
                target="_blank"
                rel="noreferrer noopener"
                color="var(--brandMain)"
                className="annotation__card-file"
              >
                {commentContent.file_name}
              </Box>
            </div> : null }
        </div>
      </div>
    );

    return (
      <StyledAnnotationWrapper
        className="annotation annotation--card annotation--comment"
        id={`annotation-${annotation.dbid}`}
      >
        <StyledAnnotationCardWrapper>
          <Box
            py={2}
            borderBottom="1px var(--grayBorderMain) solid"
            className="annotation__card-text annotation__card-activity-comment"
          >
            { authorName ?
              <RCTooltip placement="top" overlay={<UserTooltip teamUser={user.team_user} />}>
                <StyledAvatarColumn className="annotation__avatar-col">
                  <SourcePicture
                    className="avatar"
                    type="user"
                    object={user.source}
                  />
                </StyledAvatarColumn>
              </RCTooltip> : null }

            <StyledPrimaryColumn>
              <StyledAnnotationMetadata className="typography-caption">
                <span className="annotation__card-footer">
                  { authorName ?
                    <ProfileLink
                      className="annotation__card-author"
                      teamUser={user.team_user}
                    /> : null }
                  <span>
                    <span className="annotation__timestamp"><TimeBefore date={createdAt} /></span>
                  </span>
                </span>

                <StyledAnnotationActionsWrapper>
                  {annotationActions}
                </StyledAnnotationActionsWrapper>
              </StyledAnnotationMetadata>
              <Typography variant="body1" component="div">
                {contentTemplate}
              </Typography>
            </StyledPrimaryColumn>
          </Box>
        </StyledAnnotationCardWrapper>
      </StyledAnnotationWrapper>
    );
  }
}

Comment.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  setFlashMessage: PropTypes.func.isRequired,
};

export default withSetFlashMessage(injectIntl(Comment));
