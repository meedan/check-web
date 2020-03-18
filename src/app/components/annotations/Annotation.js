import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedHTMLMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import Relay from 'react-relay/classic';
import RCTooltip from 'rc-tooltip';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { stripUnit } from 'polished';
import { Link } from 'react-router';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import EmbedUpdate from './EmbedUpdate';
import EmbedCreate from './EmbedCreate';
import Memebuster from './Memebuster';
import TaskUpdate from './TaskUpdate';
import SourcePicture from '../source/SourcePicture';
import MediaDetail from '../media/MediaDetail';
import MediaUtil from '../media/MediaUtil';
import ProfileLink from '../layout/ProfileLink';
import ParsedText from '../ParsedText';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import DeleteVersionMutation from '../../relay/mutations/DeleteVersionMutation';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import DatetimeTaskResponse from '../task/DatetimeTaskResponse';
import Can, { can } from '../Can';
import TimeBefore from '../TimeBefore';
import { getErrorMessage, getStatus, getStatusStyle, emojify } from '../../helpers';
import globalStrings from '../../globalStrings';
import { stringHelper } from '../../customHelpers';
import UserTooltip from '../user/UserTooltip';
import {
  units,
  white,
  opaqueBlack16,
  black38,
  black54,
  black87,
  checkBlue,
  borderWidthLarge,
  caption,
  breakWordStyles,
  Row,
  defaultBorderRadius,
} from '../../styles/js/shared';

const dotSize = borderWidthLarge;

const dotOffset = stripUnit(units(4)) - stripUnit(dotSize);

const StyledDefaultAnnotation = styled.div`
  color: ${black87};
  display: flex;
  font: ${caption};
  ${props => (props.isRtl ? 'padding-right' : 'padding-left')}: ${units(10)};

  .annotation__default-content {
    @extend ${breakWordStyles};
    display: block;
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  }
`;

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
  margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(3)};
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

  .annotation__status {
    font: ${caption};
    text-transform: uppercase;
    margin: 0 3px;
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
      ${props => (props.isRtl ? 'right' : 'left')}: ${dotOffset}px;
    }
  }

  .annotation__card-text {
    display: flex;
    padding: ${units(3)} ${units(2)} ${units(1)} !important;
  }

  .annotation__card-activity-move-to-trash {
    background: ${checkBlue};
    color: #fff;
    border-radius: ${defaultBorderRadius};

    .annotation__timestamp {
      color: #fff;
    }
  }

  .annotation__timestamp {
    color: ${black38};
    display: inline;
    flex: 1;
    white-space: pre;
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)};
  }

  .annotation__actions {
    align-self: flex-start;
    display: none;
    flex: 1;
    text-align: ${props => (props.isRtl ? 'left' : 'right')};
  }

  .annotation__body {
    ${breakWordStyles}
  }

  .annotation__embedded-media {
    padding-bottom: ${units(1)};
    padding-top: ${units(1)};
  }

  .annotation__tag {
    &::before {
      content: '#';
    }
  }

  .annotation__update-task > span {
    display: block;
  }

  .annotation__card-embedded-medias {
    clear: both;
    margin-top: ${units(0.5)};
  }

  .annotation__keep a {
    text-decoration: underline;
  }
`;

const StyledAnnotationMetadata = styled(Row)`
  color: ${black54};
  flex-flow: wrap row;
  font: ${caption};
  margin-top: ${units(3)};

  .annotation__card-author {
    color: ${black87};
    padding-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)};
  }
`;

const StyledAnnotationActionsWrapper = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: auto;
`;

const messages = defineMessages({
  error: {
    id: 'annotation.error',
    defaultMessage: 'Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists.',
  },
  deleteButton: {
    id: 'annotation.deleteButton',
    defaultMessage: 'Delete',
  },
  and: {
    id: 'annotation.and',
    defaultMessage: 'and',
  },
  newClaim: {
    id: 'annotation.newClaim',
    defaultMessage: 'New text added by {author}',
  },
  menuTooltip: {
    id: 'annotation.menuTooltip',
    defaultMessage: 'Annotation actions',
  },
  smoochNoMessage: {
    id: 'annotation.smoochNoMessage',
    defaultMessage: 'No message was sent with the request',
  },
  adultFlag: {
    id: 'annotation.flagAdult',
    defaultMessage: 'Adult',
  },
  spoofFlag: {
    id: 'annotation.flagSpoof',
    defaultMessage: 'Spoof',
  },
  medicalFlag: {
    id: 'annotation.flagMedical',
    defaultMessage: 'Medical',
  },
  violenceFlag: {
    id: 'annotation.flagViolence',
    defaultMessage: 'Violence',
  },
  racyFlag: {
    id: 'annotation.flagRacy',
    defaultMessage: 'Racy',
  },
  spamFlag: {
    id: 'annotation.flagSpam',
    defaultMessage: 'Spam',
  },
  flagLikelihood0: {
    id: 'annotation.flagLikelihood0',
    defaultMessage: 'Unknown',
  },
  flagLikelihood1: {
    id: 'annotation.flagLikelihood1',
    defaultMessage: 'Very unlikely',
  },
  flagLikelihood2: {
    id: 'annotation.flagLikelihood2',
    defaultMessage: 'Unlikely',
  },
  flagLikelihood3: {
    id: 'annotation.flagLikelihood3',
    defaultMessage: 'Possible',
  },
  flagLikelihood4: {
    id: 'annotation.flagLikelihood4',
    defaultMessage: 'Likely',
  },
  flagLikelihood5: {
    id: 'annotation.flagLikelihood5',
    defaultMessage: 'Very likely',
  },
});

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Annotation extends Component {
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
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleDelete(id) {
    const onSuccess = () => {};

    // Either to destroy versions or annotations
    const destroy_attr = {
      parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
      annotated: this.props.annotated,
      id,
    };
    if (this.props.annotation.annotation.version === null) {
      Relay.Store.commitUpdate(
        new DeleteAnnotationMutation(destroy_attr),
        { onSuccess, onFailure: this.fail },
      );
    } else {
      destroy_attr.id = this.props.annotation.annotation.version.id;
      Relay.Store.commitUpdate(
        new DeleteVersionMutation(destroy_attr),
        { onSuccess, onFailure: this.fail },
      );
    }
  }

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.context.setMessage(message);
  };

  handleSuggestion(vid, accept) {
    const onSuccess = () => {};

    const task = { id: this.props.annotated.id };
    if (accept) {
      task.accept_suggestion = vid;
    } else {
      task.reject_suggestion = vid;
    }

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'suggest',
        annotated: this.props.annotated.project_media,
        task,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  static renderTaskResponse(type, object) {
    if (type === 'multiple_choice') {
      const response = JSON.parse(object.value);
      const selected = response.selected || [];
      if (response.other) {
        selected.push(response.other);
      }
      return <ul>{selected.map(s => <li><ParsedText text={s} /></li>)}</ul>;
    } else if (type === 'geolocation') {
      const geojson = JSON.parse(object.value);
      const { geometry: { coordinates }, properties: { name } } = geojson;
      if (!coordinates[0] || !coordinates[1]) {
        return (
          <a
            style={{ textDecoration: 'underline' }}
            href={`http://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}&zoom=12#map=12/${coordinates[0]}/${coordinates[1]}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ParsedText text={name} block />
          </a>
        );
      }
      return <ParsedText text={name} block />;
    } else if (type === 'datetime') {
      return <DatetimeTaskResponse response={object.value} />;
    }
    return <ParsedText text={object.value} block />;
  }

  render() {
    const { annotation: activity, annotated, annotation: { annotation } } = this.props;
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    let annotationActions = null;
    if (annotation && annotation.annotation_type) {
      const permission = `destroy ${annotation.annotation_type
        .charAt(0)
        .toUpperCase()}${annotation.annotation_type.slice(1)}`;
      annotationActions = can(annotation.permissions, permission) ? (
        <div>
          <IconButton
            className="menu-button"
            onClick={this.handleOpenMenu}
          >
            <Tooltip title={this.props.intl.formatMessage(messages.menuTooltip)}>
              <MoreHoriz />
            </Tooltip>
          </IconButton>
          <Menu
            id="customized-menu"
            anchorEl={this.state.anchorEl}
            keepMounted
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleCloseMenu}
          >
            <Can permissions={annotation.permissions} permission={permission}>
              <MenuItem
                className="annotation__delete"
                onClick={this.handleDelete.bind(this, annotation.id)}
              >
                {this.props.intl.formatMessage(messages.deleteButton)}
              </MenuItem>
            </Can>
            <MenuItem>
              <a
                href={`#annotation-${activity.dbid}`}
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

    const updatedAt = MediaUtil.createdAt({ published: activity.created_at });
    const timestamp = updatedAt
      ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span>
      : null;
    let authorName = activity.user
      ? <ProfileLink className="annotation__author-name" user={activity.user} team={annotated.team} /> : null;
    const object = JSON.parse(activity.object_after);
    const content = object.data;
    let activityType = activity.event_type;
    let contentTemplate = null;
    let showCard = false;

    switch (activityType) {
    case 'create_comment': {
      const commentText = content.text;
      const commentContent = JSON.parse(annotation.content);
      contentTemplate = (
        <div>
          <div className="annotation__card-content">
            <ParsedText text={commentText} />
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

          {/* embedded medias */}
          <div className="annotation__card-embedded-medias">
            {annotation.medias.edges.map(media => (
              <div key={media.node.dbid}>
                <MediaDetail media={media.node} condensed readonly hideRelated />
              </div>))
            }
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
      break;
    }
    case 'create_tag':
      if (activity.tag && activity.tag.tag_text) {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.taggedHeader"
              defaultMessage="Tagged #{tag} by {author}"
              values={{
                tag: activity.tag.tag_text.replace(/^#/, ''),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'destroy_comment':
      contentTemplate = (
        <em className="annotation__deleted">
          <FormattedMessage
            id="annotation.deletedComment"
            defaultMessage="Comment deleted by {author}{comment}"
            values={{
              author: authorName,
              comment: <ParsedText text={content.text} block />,
            }}
          />
        </em>);
      break;
    case 'create_task':
      contentTemplate = (
        <span className="annotation__task-created">
          <FormattedMessage
            id="annotation.taskCreated"
            defaultMessage="Task created by {author}: {task}"
            values={{
              task: content.label,
              author: authorName,
            }}
          />
        </span>
      );
      break;
    case 'create_relationship': {
      const meta = JSON.parse(activity.meta);
      if (meta) {
        const { target } = meta;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.relationshipCreated"
              defaultMessage="Related item added by {author}: {title}"
              values={{
                title: emojify(target.title),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    }
    case 'destroy_relationship': {
      const meta = JSON.parse(activity.meta);
      if (meta) {
        const { target } = meta;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.relationshipDeleted"
              defaultMessage="Related item removed by {author}: {title}"
              values={{
                title: emojify(target.title),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    }
    case 'create_assignment': {
      const meta = JSON.parse(activity.meta);
      if (meta) {
        const { type, title, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.taskAssignmentCreated"
                defaultMessage="Task assigned to {name} by {author}: {title}"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.mediaAssignmentCreated"
                defaultMessage="Item assigned to {name} by {author}"
                values={values}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'destroy_assignment': {
      const meta = JSON.parse(activity.meta);
      if (meta) {
        const { type, title, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.taskAssignmentDeleted"
                defaultMessage="Task unassigned from {name} by {author}: {title}"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.mediaAssignmentDeleted"
                defaultMessage="Item unassigned from {name} by {author}"
                values={values}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'create_dynamic':
    case 'update_dynamic':
      if (object.annotation_type === 'flag') {
        showCard = true;
        const { flags } = object.data;
        const flagsContent = (
          <ul>
            { Object.keys(flags).map((flag) => {
              const likelihood = this.props.intl.formatMessage(messages[`flagLikelihood${flags[flag]}`]);
              const flagName = this.props.intl.formatMessage(messages[`${flag}Flag`]);
              return (
                <li style={{ margin: units(1), listStyle: 'disc' }}>{flagName}: {likelihood}</li>
              );
            })}
          </ul>
        );
        contentTemplate = (
          <div>
            <FormattedMessage
              id="annotation.flag"
              defaultMessage="Classification result:"
            />
            {flagsContent}
          </div>
        );
      } else if (object.annotation_type === 'verification_status' || object.annotation_type === 'translation_status') {
        const statusChanges = JSON.parse(activity.object_changes_json);
        if (statusChanges.locked) {
          if (statusChanges.locked[1]) {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusLocked"
                defaultMessage="Item status locked by {author}"
                values={{ author: authorName }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusUnlocked"
                defaultMessage="Item status unlocked by {author}"
                values={{ author: authorName }}
              />
            );
          }
        } else if (statusChanges.assigned_to_id) {
          const assignment = JSON.parse(activity.meta);
          if (assignment.assigned_to_name) {
            contentTemplate = (
              <FormattedMessage
                id="annotation.mediaAssigned"
                defaultMessage="Item assigned to {name} by {author}"
                values={{
                  name: assignment.assigned_to_name,
                  author: authorName,
                }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.mediaUnassigned"
                defaultMessage="Item unassigned from {name} by {author}"
                values={{
                  name: assignment.assigned_from_name,
                  author: authorName,
                }}
              />
            );
          }
        }
      }
      break;
    case 'create_dynamicannotationfield':
    case 'update_dynamicannotationfield':
    {
      if (object.field_name === 'metadata_value' && activityType === 'update_dynamicannotationfield') {
        contentTemplate = (
          <EmbedUpdate
            activity={activity}
            authorName={authorName}
          />);
      }

      if (object.field_name === 'verification_status_status' && config.appName === 'check' && activityType === 'update_dynamicannotationfield') {
        const statusValue = object.value;
        const statusCode = statusValue.toLowerCase().replace(/[ _]/g, '-');
        const status = getStatus(this.props.annotated.verification_statuses, statusValue);
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.statusSetHeader"
              defaultMessage="Status set to {status} by {author}"
              values={{
                status: (
                  <span
                    className={`annotation__status annotation__status--${statusCode}`}
                    style={{ color: getStatusStyle(status, 'color') }}
                  >
                    {status.label}
                  </span>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'team_bot_response_formatted_data') {
        activityType = 'bot_response';
        const botResponse = JSON.parse(object.value);
        contentTemplate = (
          <div>
            <div className="annotation__card-content annotation__bot-response">
              <span>
                <b>{botResponse.title}</b><br />
                <ParsedText text={botResponse.description} />
              </span>
              <div>
                { botResponse.image_url ?
                  <div
                    style={{
                      background: `transparent url('${botResponse.image_url}') top left no-repeat`,
                      backgroundSize: 'cover',
                      border: '1px solid #ccc',
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    className="annotation__card-thumbnail annotation__bot-response-thumbnail"
                    onClick={this.handleOpenCommentImage.bind(this, botResponse.image_url)}
                  /> : null }
              </div>
            </div>

            { botResponse.image_url && !!this.state.zoomedCommentImage ?
              <Lightbox
                onCloseRequest={this.handleCloseCommentImage.bind(this)}
                mainSrc={this.state.zoomedCommentImage}
              /> : null}
          </div>
        );
      }

      if (/^suggestion_/.test(object.field_name)) {
        activityType = 'task_answer_suggestion';
        const suggestion = JSON.parse(object.value);
        const review = activity.meta ? JSON.parse(activity.meta) : null;
        const { team } = this.props.annotated.project_media;
        contentTemplate = (
          <div>
            <div className="annotation__card-content annotation__task-answer-suggestion">
              <ParsedText text={suggestion.comment} />
            </div>
            <br />
            <p>
              <small>
                <Link to={`/check/bot/${activity.user.bot.dbid}`}>
                  <FormattedMessage
                    id="annotation.seeHowThisBotWorks"
                    defaultMessage="See how this bot works"
                  />
                </Link>
              </small>
            </p>
            { review ?
              <div style={{ fontStyle: 'italic' }}>
                <small>
                  { review.accepted ?
                    <FormattedMessage
                      id="annotation.suggestionAccepted"
                      defaultMessage="Accepted by {user}"
                      values={{
                        user: <ProfileLink user={review.user} team={team} />,
                      }}
                    /> :
                    <FormattedMessage
                      id="annotation.suggestionRejected"
                      defaultMessage="Rejected by {user}"
                      values={{
                        user: <ProfileLink user={review.user} team={team} />,
                      }}
                    />
                  }
                </small>
              </div> :
              <div>
                <Button
                  onClick={this.handleSuggestion.bind(this, activity.dbid, true)}
                  style={{ border: `1px solid ${black38}` }}
                  color="primary"
                >
                  <FormattedMessage
                    id="annotation.acceptSuggestion"
                    defaultMessage="Accept"
                  />
                </Button>
                &nbsp;
                <Button
                  onClick={this.handleSuggestion.bind(this, activity.dbid, false)}
                  style={{ border: `1px solid ${black38}` }}
                  color="primary"
                >
                  <FormattedMessage
                    id="annotation.rejectSuggestion"
                    defaultMessage="Reject"
                  />
                </Button>
              </div>
            }
          </div>
        );
      }

      if (/^response_/.test(object.field_name) && activity.task) {
        contentTemplate = (
          <span className="annotation__task-resolved">
            <FormattedMessage
              id="annotation.taskResolve"
              defaultMessage="Task answered by {author}: {task}{response}"
              values={{
                task: activity.task.label,
                author: authorName,
                response: Annotation.renderTaskResponse(activity.task.type, object),
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'translation_text') {
        const translationContent = JSON.parse(annotation.content);
        let language = translationContent.find(it => it.field_name === 'translation_language');
        language = (language && language.formatted_value) || '?';
        contentTemplate = (
          <span className="annotation__translation-text">
            <FormattedMessage
              id="annotation.translation"
              defaultMessage="Translated to {language} by {author}{translation}"
              values={{
                language,
                author: authorName,
                translation: <ParsedText text={object.value} block />,
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'translation_status_status') {
        const statusCode = object.value.toLowerCase().replace(/[ _]/g, '-');
        const status = getStatus(this.props.annotated.translation_statuses, object.value);
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.translationStatus"
              defaultMessage="Translation status set to {status} by {author}"
              values={{
                status: (
                  <span
                    className={`annotation__status annotation__status--${statusCode}`}
                    style={{ color: getStatusStyle(status, 'color') }}
                  >
                    {status.label}
                  </span>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'translation_published') {
        const published = JSON.parse(object.value);
        const colors = {
          twitter: '#4099FF',
          facebook: '#3b5998',
        };
        contentTemplate = [];
        Object.getOwnPropertyNames(published).forEach((provider) => {
          const name = provider.charAt(0).toUpperCase() + provider.slice(1);
          const color = colors[provider] || '#333';
          const values = {
            link: (
              <a
                style={{ color, fontWeight: 'bold' }}
                href={published[provider]}
                target="_blank"
                rel="noreferrer noopener"
              >
                {name}
              </a>
            ),
          };
          let message = (
            <FormattedMessage
              id="annotation.translationPublished"
              defaultMessage="Translation published to {link}"
              values={values}
            />
          );
          if (provider === 'facebook') {
            message = (
              <FormattedMessage
                id="annotation.publishTranslation"
                defaultMessage="Publish this translation to {link}"
                values={values}
              />
            );
          }
          contentTemplate.push(message);
        });
      }
      // TODO Replace with Pender-supplied names.
      const archivers = {
        archive_is_response: 'Archive.is',
        archive_org_response: 'Archive.org',
        keep_backup_response: 'Video Vault',
        perma_cc_response: 'Perma.cc',
        video_archiver_response: 'Video Archiver',
      };
      if (object.annotation_type === 'archiver' && activityType === 'create_dynamicannotationfield') {
        const archiveContent = JSON.parse(annotation.content);
        const archive = archiveContent.filter(item => item.field_name === object.field_name);
        const archiveResponse = JSON.parse(archive[0].value);
        const archiveLink = archiveResponse.location;
        const archiveStatus = parseInt(archiveResponse.status, 10);
        const archiveName = archivers[object.field_name];
        contentTemplate = null;
        if (archiveLink) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverSuccess"
                defaultMessage='In case this item goes offline, you can <a href="{link}" target="_blank" rel="noopener noreferrer">access a backup at {name}</a>.'
                values={{ link: archiveLink, name: archiveName }}
              />
            </span>
          );
        } else if (archiveResponse.error || archiveStatus >= 400) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverError"
                defaultMessage="Sorry, an error occurred while archiving the item at {name}. Please refresh the item to try again and contact {supportEmail} if the condition persists."
                values={{ name: archiveName, supportEmail: stringHelper('SUPPORT_EMAIL') }}
              />
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverWait"
                defaultMessage="This item is being archived at {name}. The archive link will be displayed here when it's ready."
                values={{ name: archiveName }}
              />
            </span>
          );
        }
      }

      if (object.field_name === 'memebuster_operation') {
        contentTemplate = (
          <Memebuster
            activity={activity}
            object={object}
            authorName={authorName}
          />
        );
      }

      if (object.field_name === 'embed_code_copied') {
        contentTemplate = (
          <span className="annotation__embed-code-copied">
            <FormattedMessage
              id="annotation.embedCodeCopied"
              defaultMessage="An embed code of the item has been generated and copied. The item may now be publicly viewable."
            />
          </span>
        );
      }

      if (object.field_name === 'pender_archive_response' && activityType === 'create_dynamicannotationfield') {
        const penderResponse = JSON.parse(JSON.parse(annotation.content)[0].value);
        contentTemplate = null;
        if (penderResponse.error) {
          contentTemplate = (
            <span className="annotation__pender-archive">
              <FormattedHTMLMessage
                id="annotation.penderArchiveResponseError"
                defaultMessage="Sorry, an error occurred while taking a screenshot of the item. Please refresh the item to try again and contact {supportEmail} if the condition persists."
                values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
              />
            </span>
          );
        } else if (penderResponse.screenshot_taken) {
          activityType = 'screenshot_taken';
          authorName = null;
          contentTemplate = (
            <div>
              <div className="annotation__card-content annotation__pender-archive">
                <FormattedHTMLMessage
                  id="annotation.penderArchiveResponse"
                  defaultMessage="Keep has taken a screenshot of this URL."
                />
                <div>
                  <div
                    style={{
                      background: `transparent url('${penderResponse.screenshot_url}') top left no-repeat`,
                      backgroundSize: 'cover',
                      border: '1px solid #ccc',
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    className="annotation__card-thumbnail annotation__pender-archive-thumbnail"
                    onClick={this.handleOpenCommentImage.bind(this, penderResponse.screenshot_url)}
                  />
                </div>
              </div>

              {/* lightbox */}
              {penderResponse.screenshot_url && !!this.state.zoomedCommentImage ?
                <Lightbox
                  onCloseRequest={this.handleCloseCommentImage.bind(this)}
                  mainSrc={this.state.zoomedCommentImage}
                /> : null}
            </div>
          );
        } else {
          contentTemplate = (
            <span className="annotation__pender-archive">
              <FormattedHTMLMessage
                id="annotation.penderArchiveWait"
                defaultMessage="The screenshot of this item is being taken by Keep. Come back in a few minutes to see it."
              />
            </span>
          );
        }
        contentTemplate = null;
      }

      if (object.field_name === 'smooch_data' && activityType === 'create_dynamicannotationfield') {
        showCard = true;
        let messageText = JSON.parse(object.value).text.trim();
        if (!messageText) {
          messageText = this.props.intl.formatMessage(messages.smoochNoMessage);
        }
        contentTemplate = (
          <div className="annotation__card-content">
            <ParsedText text={messageText} />
          </div>
        );
      }

      break;
    }
    case 'update_embed':
      contentTemplate = (
        <EmbedUpdate
          activity={activity}
          authorName={authorName}
        />);
      break;
    case 'create_embed':
      contentTemplate = (
        <EmbedCreate
          annotated={annotated}
          content={content}
          authorName={authorName}
        />);
      break;
    case 'update_projectmedia':
      if (activity.projects.edges.length > 0 && activity.user) {
        const previousProject = activity.projects.edges[0].node;
        const currentProject = activity.projects.edges[1].node;
        const urlPrefix = `/${annotated.team.slug}/project/`;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.projectMoved"
              defaultMessage="Moved from list {previousProject} to {currentProject} by {author}"
              values={{
                previousProject: (
                  <Link to={urlPrefix + previousProject.dbid}>
                    {previousProject.title}
                  </Link>
                ),
                currentProject: (
                  <Link to={urlPrefix + currentProject.dbid}>
                    {currentProject.title}
                  </Link>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      } else if (activity.object_changes_json === '{"archived":[false,true]}') {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.movedToTrash"
              defaultMessage="Moved to the trash by {author}"
              values={{
                author: authorName,
              }}
            />
          </span>
        );
      } else if (activity.object_changes_json === '{"archived":[true,false]}') {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.movedFromTrash"
              defaultMessage="Moved out of the trash by {author}"
              values={{
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'copy_projectmedia':
      if (activity.projects.edges.length > 0 && activity.teams.edges.length > 0 && activity.user) {
        const previousProject = activity.projects.edges[0].node;
        const previousTeam = activity.teams.edges[0].node;
        const previousProjectUrl = `/${previousProject.team.slug}/project/`;
        const previousTeamUrl = `/${previousTeam.slug}/`;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.teamCopied"
              defaultMessage="Copied from list {previousProject} on workspace {previousTeam} by {author}"
              values={{
                previousProject: (
                  <Link to={previousProjectUrl + previousTeam.dbid}>
                    {previousProject.title}
                  </Link>
                ),
                previousTeam: (
                  <Link to={previousTeamUrl}>
                    {previousTeam.name}
                  </Link>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'update_task':
      contentTemplate = <TaskUpdate activity={activity} authorName={authorName} />;
      break;
    default:
      contentTemplate = null;
      break;
    }

    if (contentTemplate === null) {
      return null;
    }

    const cardActivities = ['create_comment', 'screenshot_taken', 'bot_response', 'task_answer_suggestion'];
    const useCardTemplate = (cardActivities.indexOf(activityType) > -1 || showCard);
    const templateClass = `annotation--${useCardTemplate ? 'card' : 'default'}`;
    const typeClass = annotation ? `annotation--${annotation.annotation_type}` : '';
    return (
      <StyledAnnotationWrapper
        className={`annotation ${templateClass} ${typeClass}`}
        id={`annotation-${activity.dbid}`}
        isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
      >
        {useCardTemplate ?
          <StyledAnnotationCardWrapper isRtl={isRtl}>
            <Card>
              <CardContent
                className={`annotation__card-text annotation__card-activity-${activityType.replace(
                  /_/g,
                  '-',
                )}`}
              >
                {authorName ?
                  <RCTooltip placement="top" overlay={<UserTooltip user={activity.user} team={annotated.team} />}>
                    <StyledAvatarColumn isRtl={isRtl} className="annotation__avatar-col">
                      <SourcePicture
                        className="avatar"
                        type="user"
                        size="small"
                        object={activity.user.source}
                      />
                    </StyledAvatarColumn>
                  </RCTooltip> : null}

                <StyledPrimaryColumn isRtl={isRtl}>
                  {contentTemplate}
                  <StyledAnnotationMetadata isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
                    <span className="annotation__card-footer">
                      {authorName ?
                        <ProfileLink
                          className="annotation__card-author"
                          user={activity.user}
                          team={annotated.team}
                        /> : null}
                      <span>
                        {timestamp}
                      </span>
                    </span>

                    <StyledAnnotationActionsWrapper isRtl={isRtl}>
                      {annotationActions}
                    </StyledAnnotationActionsWrapper>
                  </StyledAnnotationMetadata>
                </StyledPrimaryColumn>

              </CardContent>
            </Card>
          </StyledAnnotationCardWrapper> :
          <StyledDefaultAnnotation isRtl={isRtl} className="annotation__default">
            <span>
              <span className="annotation__default-content">{contentTemplate}</span>
              {timestamp}
            </span>
          </StyledDefaultAnnotation>}
      </StyledAnnotationWrapper>
    );
  }
}

Annotation.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

Annotation.contextTypes = {
  setMessage: PropTypes.func,
};

export default injectIntl(Annotation);
