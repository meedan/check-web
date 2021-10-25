import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import RCTooltip from 'rc-tooltip';
import styled from 'styled-components';
import { stripUnit } from 'polished';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
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
import globalStrings from '../../globalStrings';
import { stringHelper } from '../../customHelpers';
import {
  units,
  white,
  opaqueBlack16,
  black38,
  black54,
  black87,
  borderWidthLarge,
  caption,
  breakWordStyles,
  Row,
} from '../../styles/js/shared';

const dotSize = borderWidthLarge;

const dotOffset = stripUnit(units(4)) - stripUnit(dotSize);

const StyledAnnotationCardWrapper = styled.div`
  width: 100%;
  z-index: initial !important;

  > div > div {
    padding-bottom: 0 !important;
  }

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
    display: flex;
    width: 100%;

    & > span:first-child {
      flex: 1;
    }
  }

  .annotation__card-thumbnail {
    padding: ${units(1)};
  }
`;

const StyledAnnotationWrapper = styled.section`
  position: relative;
  display: flex;
  padding: ${units(1)} 0;
  position: relative;

  &:not(.annotation--card) {
    // The timeline dot
    &::before {
      background-color: ${opaqueBlack16};
      border-radius: 100%;
      content: '';
      height: ${units(1)};
      outline: ${dotSize} solid ${white};
      position: absolute;
      top: ${units(2)};
      width: ${units(1)};
      ${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${dotOffset}px;
    }
  }

  .annotation__card-text {
    display: flex;
    padding: ${units(3)} ${units(2)} ${units(1)} !important;
  }

  .annotation__timestamp {
    color: ${black38};
    display: inline;
    flex: 1;
    white-space: pre;
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)};
  }
`;

const StyledAnnotationMetadata = styled(Row)`
  color: ${black54};
  flex-flow: wrap row;
  font: ${caption};
  margin-top: ${units(3)};

  .annotation__card-author {
    color: ${black87};
    padding-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)};
  }
`;

const StyledAnnotationActionsWrapper = styled.div`
  margin-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: auto;
`;

const FlagName = ({ flag }) => {
  switch (flag) {
  case 'adult': return <FormattedMessage id="annotation.flagAdult" defaultMessage="Adult" />;
  case 'medical': return <FormattedMessage id="annotation.flagMedical" defaultMessage="Medical" />;
  case 'violence': return <FormattedMessage id="annotation.flagViolence" defaultMessage="Violence" />;
  case 'racy': return <FormattedMessage id="annotation.flagRacy" defaultMessage="Racy" />;
  case 'spam': return <FormattedMessage id="annotation.flagSpam" defaultMessage="Spam" />;
  default: return null;
  }
};

FlagName.propTypes = {
  flag: PropTypes.oneOf(['adult', 'medical', 'violence', 'racy', 'spam']).isRequired,
};

const FlagLikelihood = ({ likelihood }) => {
  switch (likelihood) {
  case 0: return <FormattedMessage id="annotation.flagLikelihood0" defaultMessage="Unknown" />;
  case 1: return <FormattedMessage id="annotation.flagLikelihood1" defaultMessage="Very unlikely" />;
  case 2: return <FormattedMessage id="annotation.flagLikelihood2" defaultMessage="Unlikely" />;
  case 3: return <FormattedMessage id="annotation.flagLikelihood3" defaultMessage="Possible" />;
  case 4: return <FormattedMessage id="annotation.flagLikelihood4" defaultMessage="Likely" />;
  case 5: return <FormattedMessage id="annotation.flagLikelihood5" defaultMessage="Very likely" />;
  default: return null;
  }
};

FlagLikelihood.propTypes = {
  likelihood: PropTypes.oneOf([0, 1, 2, 3, 4, 5]).isRequired,
};

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Comment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      zoomedCommentImage: false,
    };
  }

  handleCloseCommentImage() {
    this.setState({ zoomedCommentImage: false });
  }

  handleOpenCommentImage(image) {
    this.setState({ zoomedCommentImage: image });
  }

  handleOpenMenu = (e) => {
    e.stopPropagation();
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleDelete(id) {
    const onSuccess = () => {};
    const destroy_attr = {
      parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
      annotated: this.props.annotated,
      id,
    };
    Relay.Store.commitUpdate(
      new DeleteAnnotationMutation(destroy_attr),
      { onSuccess, onFailure: this.fail },
    );
  }

  fail = (transaction) => {
    const message = getErrorMessage(
      transaction,
      (
        <FormattedMessage
          {...globalStrings.unknownError}
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      ),
    );
    this.props.setFlashMessage(message, 'error');
  };

  render() {
    console.log('Comment-props', this.props); // eslint-disable-line no-console
    const { annotation } = this.props;
    let annotationActions = null;
    if (annotation && annotation.annotation_type) {
      const canUpdate = can(annotation.permissions, 'update Comment');
      const canDestroy = can(annotation.permissions, 'destroy Comment');
      const canDoAnnotationActions = canDestroy || canUpdate;
      annotationActions = canDoAnnotationActions ? (
        <div>
          <IconButton
            className="menu-button"
            onClick={this.handleOpenMenu}
          >
            <MoreHoriz />
          </IconButton>
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
                onClick={this.handleDelete.bind(this, annotation.id)}
              >
                <FormattedMessage id="annotation.editButton" defaultMessage="Edit" />
              </MenuItem>
            ) : null}
            {canDestroy ? (
              <MenuItem
                className="annotation__delete"
                onClick={this.handleDelete.bind(this, annotation.id)}
              >
                <FormattedMessage id="annotation.deleteButton" defaultMessage="Delete" />
              </MenuItem>
            ) : null}
            <MenuItem>
              <a
                href={`#annotation-${annotation.dbid}`}
                style={{ textDecoration: 'none', color: black87 }}
              >
                <FormattedMessage
                  id="annotation.permalink"
                  defaultMessage="Permalink"
                />
              </a>
            </MenuItem>
          </Menu>
        </div>)
        : null;
    }

    const updatedAt = parseStringUnixTimestamp(annotation.created_at);
    const timestamp = updatedAt
      ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span>
      : null;

    const { user } = annotation.annotator;
    const authorName = user
      ? <ProfileLink className="annotation__author-name" teamUser={user.team_user} /> : null;

    const commentText = annotation.text;
    const commentContent = JSON.parse(annotation.content);
    const contentTemplate = (
      <div>
        <div className="annotation__card-content">
          <div >
            <ParsedText text={commentText} />
          </div>
          {/* thumbnail */}
          {commentContent.original ?
            <div onClick={this.handleOpenCommentImage.bind(this, commentContent.original)}>
              <img
                src={commentContent.thumbnail}
                className="annotation__card-thumbnail"
                alt=""
              />
            </div> : null}
        </div>

        {/* lightbox */}
        {commentContent.original && !!this.state.zoomedCommentImage
          ? <Lightbox
            onCloseRequest={this.handleCloseCommentImage.bind(this)}
            mainSrc={this.state.zoomedCommentImage}
          />
          : null}
      </div>
    );

    return (
      <StyledAnnotationWrapper
        className="annotation annotation--card annotation--comment"
        id={`annotation-${annotation.dbid}`}
      >
        <StyledAnnotationCardWrapper>
          <Card>
            <CardContent
              className="annotation__card-text annotation__card-activity-comment"
            >
              { authorName ?
                <RCTooltip placement="top" overlay={<UserTooltip teamUser={user.team_user} />}>
                  <StyledAvatarColumn className="annotation__avatar-col">
                    <SourcePicture
                      className="avatar"
                      type="user"
                      size="small"
                      object={user.source}
                    />
                  </StyledAvatarColumn>
                </RCTooltip> : null }

              <StyledPrimaryColumn>
                <StyledAnnotationMetadata>
                  <span className="annotation__card-footer">
                    { authorName ?
                      <ProfileLink
                        className="annotation__card-author"
                        teamUser={user.team_user}
                      /> : null }
                    <span>
                      {timestamp}
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
            </CardContent>
          </Card>
        </StyledAnnotationCardWrapper>
      </StyledAnnotationWrapper>
    );
  }
}

Comment.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  setFlashMessage: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default withSetFlashMessage(injectIntl(Comment));
