import React, { Component } from 'react';
import {
  FormattedMessage,
  FormattedHTMLMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import Relay from 'react-relay/classic';
import Tooltip from 'rc-tooltip';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { stripUnit } from 'polished';
import { Link } from 'react-router';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Card, CardText } from 'material-ui/Card';
import IconMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MdImage from 'react-icons/lib/md/image';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import EmbedUpdate from './EmbedUpdate';
import EmbedCreate from './EmbedCreate';
import TaskUpdate, { shouldLogChange } from './TaskUpdate';
import SourcePicture from '../source/SourcePicture';
import MediaDetail from '../media/MediaDetail';
import MediaUtil from '../media/MediaUtil';
import ProfileLink from '../layout/ProfileLink';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import DeleteVersionMutation from '../../relay/mutations/DeleteVersionMutation';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import Can, { can } from '../Can';
import TimeBefore from '../TimeBefore';
import { safelyParseJSON, getStatus, getStatusStyle } from '../../helpers';
import ParsedText from '../ParsedText';
import DatetimeTaskResponse from '../task/DatetimeTaskResponse';
import UserTooltip from '../user/UserTooltip';
import { mapGlobalMessage } from '../MappedMessage';
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
  columnWidthMedium,
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
  max-width: ${columnWidthMedium};
  ${props => (props.isRtl ? 'padding-right' : 'padding-left')}: ${units(10)};

  .annotation__default-content {
    @extend ${breakWordStyles};
    display: block;
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  }
`;

const StyledAnnotationCardWrapper = styled.div`
  max-width: ${units(90)};
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

  .annotation__reverse-image-search {
    cursor: pointer;
    display: inline-block;
    font-weight: 700;
    margin: 0 ${units(1)};
    text-transform: uppercase;
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
    defaultMessage: 'Could not delete annotation',
  },
  deleteButton: {
    id: 'annotation.deleteButton',
    defaultMessage: 'Delete',
  },
  reverseImage: {
    id: 'annotation.reverseImage',
    defaultMessage:
      'This item contains at least one image. Click Search to look for potential duplicates on Google.',
  },
  reverseImageFacebook: {
    id: 'annotation.reverseImageFacebook',
    defaultMessage: 'This item contains at least one image. However, the image is contained in a Facebook post, and {appName} cannot send that image directly to reverse image search. Consider conducting a manual search using tools like Google or TinEye.',
  },
  and: {
    id: 'annotation.and',
    defaultMessage: 'and',
  },
  newClaim: {
    id: 'annotation.newClaim',
    defaultMessage: 'New claim added by {author}',
  },
});

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Annotation extends Component {
  static handleReverseImageSearch(path) {
    const imagePath = path ? `?&image_url=${path}` : '';
    window.open(`https://www.google.com/searchbyimage${imagePath}`);
  }

  constructor(props) {
    super(props);

    this.state = {
      zoomedCommentImage: false,
      disableMachineTranslation: false,
    };
  }

  handleCloseCommentImage() {
    this.setState({ zoomedCommentImage: false });
  }

  handleOpenCommentImage(image) {
    this.setState({ zoomedCommentImage: image });
  }

  handleDelete(id) {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      const json = safelyParseJSON(error.source);
      this.handleError(json);
    };

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
        { onSuccess, onFailure },
      );
    } else {
      destroy_attr.id = this.props.annotation.annotation.version.id;
      Relay.Store.commitUpdate(
        new DeleteVersionMutation(destroy_attr),
        { onSuccess, onFailure },
      );
    }
  }

  handleError(json) {
    let message = this.props.intl.formatMessage(messages.error);
    if (json && json.error) {
      message = json.error;
    }
    // eslint-disable-next-line no-console
    console.error(message);
  }

  handleUpdateMachineTranslation() {
    const onFailure = (transaction) => {
      // TODO Review this code to understand what it is supposed to do.
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(error);
      }
    };

    const onSuccess = () => {
      this.setState({ disableMachineTranslation: true });
    };

    if (!this.state.disableMachineTranslation) {
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          update_mt: 1,
          id: this.props.annotated.id,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ disableMachineTranslation: true });
    }
  }

  render() {
    const { annotation: activity, annotated, annotation: { annotation } } = this.props;
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    let annotationActions = null;
    if (annotation) {
      const permission = `destroy ${annotation.annotation_type
        .charAt(0)
        .toUpperCase()}${annotation.annotation_type.slice(1)}`;
      annotationActions = can(annotation.permissions, permission) ? (
        <IconMenu
          iconButtonElement={
            <IconButton className="menu-button">
              <IconMoreHoriz />
            </IconButton>
          }
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
        </IconMenu>)
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
      contentTemplate = (
        <span>
          <FormattedMessage
            id="annotation.taggedHeader"
            defaultMessage="Tagged #{tag} by {author}"
            values={{ tag: content.tag.replace(/^#/, ''), author: authorName }}
          />
        </span>
      );
      break;
    case 'destroy_comment':
      contentTemplate = (
        <em className="annotation__deleted">
          <FormattedMessage
            id="annotation.deletedComment"
            defaultMessage='Comment deleted by {author}: "{comment}"'
            values={{
              author: authorName,
              comment: content.text,
            }}
          />
        </em>);
      break;
    case 'create_task':
      contentTemplate = (
        <span>
          <FormattedMessage
            id="annotation.taskCreated"
            defaultMessage='Task "{task}" created by {author}'
            values={{ task: content.label, author: authorName }}
          />
        </span>
      );
      break;
    case 'create_relationship': {
      const meta = JSON.parse(activity.meta);
      if (meta) {
        const { target } = meta;
        const targetUrl = target.url.replace(/https?:\/\/[^/]+/, '');
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.relationshipCreated"
              defaultMessage='Related {type} "{title}" added by {author}'
              values={{
                type: meta.target.type,
                title: <Link to={targetUrl}>{target.title}</Link>,
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
              defaultMessage='Related {type} "{title}" deleted by {author}'
              values={{
                type: meta.target.type,
                title: target.title,
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    }
    case 'create_dynamic':
    case 'update_dynamic':
      if (object.annotation_type === 'verification_status' || object.annotation_type === 'translation_status') {
        const statusChanges = JSON.parse(activity.object_changes_json);
        if (statusChanges.locked) {
          if (statusChanges.locked[1]) {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusLocked"
                defaultMessage="Status locked by {author}"
                values={{ author: authorName }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusUnlocked"
                defaultMessage="Status unlocked by {author}"
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
                defaultMessage="Assigned to {name} by {author}"
                values={{ name: assignment.assigned_to_name, author: authorName }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.mediaUnassigned"
                defaultMessage="Unassigned from {name} by {author}"
                values={{ name: assignment.assigned_from_name, author: authorName }}
              />
            );
          }
        }
      }
      break;
    case 'create_dynamicannotationfield':
    case 'update_dynamicannotationfield':
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

      if (/^response_/.test(object.field_name) && activity.task) {
        const format_response = (type) => {
          if (type === 'multiple_choice') {
            const response_obj = JSON.parse(object.value);
            const selected_array = response_obj.selected || [];
            if (response_obj.other) {
              selected_array.push(response_obj.other);
            }
            const last_item = selected_array.length > 1
              ? ` ${this.props.intl.formatMessage(messages.and)} ${selected_array.splice(-1, 1)}`
              : '';
            return selected_array.join(', ') + last_item;
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
                  {name}
                </a>
              );
            }

            return name;
          } else if (type === 'datetime') {
            return <DatetimeTaskResponse response={object.value} />;
          }
          return <ParsedText text={object.value} />;
        };
        contentTemplate = (
          <span className="// annotation__task-resolved">
            <FormattedMessage
              id="annotation.taskResolve"
              defaultMessage='Task "{task}" answered by {author}: "{response}"'
              values={{
                task: activity.task.label,
                author: authorName,
                response: format_response(activity.task.type),
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'reverse_image_path') {
        const [reverseImage, value] = annotated.domain === 'facebook.com'
          ? [messages.reverseImageFacebook, null]
          : [messages.reverseImage, object.value];
        contentTemplate = (
          <span className="annotation__reverse-image">
            <MdImage />
            <span>{this.props.intl.formatMessage(reverseImage, { appName: mapGlobalMessage(this.props.intl, 'appNameHuman') })}</span>
            {annotated.domain === 'facebook.com' ?
              null :
              <span
                className="annotation__reverse-image-search"
                title="Google Images"
                onClick={Annotation.handleReverseImageSearch.bind(this, value)}
              >
                <FormattedMessage id="annotation.reverseImageSearch" defaultMessage="Search" />
              </span>
            }
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
              defaultMessage='Translated to {language} by {author}: "{translation}"'
              values={{
                language,
                author: authorName,
                translation: <ParsedText text={object.value} />,
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'mt_translations') {
        const annotation_content = JSON.parse(annotation.content);
        const { formatted_value } = annotation_content[0];
        if (!formatted_value.length) {
          contentTemplate = (
            <span className="annotation__mt-translations">
              <button
                className="annotation__mt-translations"
                onClick={this.handleUpdateMachineTranslation.bind(this)}
                disabled={this.state.disableMachineTranslation}
              >
                <FormattedMessage
                  id="annotation.emptyMachineTranslation"
                  defaultMessage="Add machine translation"
                />
              </button>
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__mt-translations">
              <ul className="mt-list">
                {formatted_value.map(mt => (
                  <li className="mt__list-item">
                    <FormattedMessage
                      id="annotation.machineTranslation"
                      defaultMessage='Machine translation for "{lang}" is: {text}'
                      values={{ lang: mt.lang_name, text: mt.text }}
                    />
                  </li>))}
              </ul>
            </span>
          );
        }
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
          contentTemplate.push((
            <span>
              <FormattedMessage
                id="annotation.translationPublished"
                defaultMessage="Translation published to {link}"
                values={{
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
                }}
              />
            </span>));
        });
      }

      if (object.field_name === 'keep_backup_response' && activityType === 'create_dynamicannotationfield') {
        const annotation_content = JSON.parse(annotation.content);
        const keep = JSON.parse(annotation_content[0].value);
        const keepLink = keep.location;
        const keepStatus = parseInt(keep.status, 10);
        contentTemplate = null;
        if (keepLink) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverSuccess"
                defaultMessage='In case this link goes offline, you can <a href="{link}" target="_blank" rel="noopener noreferrer">access a backup on <b>{name}</b> via Keep</a>'
                values={{ link: keepLink, name: 'Video Vault' }}
              />
            </span>
          );
        } else if (keepStatus === 418 || keep.error) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverError"
                defaultMessage="There was an error when Keep tried to archive this item to <b>{name}</b>. Refresh this media to try again."
                values={{ name: 'Video Vault' }}
              />
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverWait"
                defaultMessage="This item is being archived to <b>{name}</b> by Keep. Come back in a few minutes to receive a confirmation link."
                values={{ name: 'Video Vault' }}
              />
            </span>
          );
        }
      }

      if ((object.field_name === 'archive_is_response' || object.field_name === 'archive_org_response') && activityType === 'create_dynamicannotationfield') {
        const archiveIsAnnotationContent = JSON.parse(annotation.content);
        const archiveIsResponse = JSON.parse(archiveIsAnnotationContent[0].value);
        const archiveIsLink = archiveIsResponse.location;
        let archiverName = 'Archive.is';
        if (object.field_name === 'archive_org_response') {
          archiverName = 'Archive.org';
        }
        contentTemplate = null;
        if (archiveIsLink) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverSuccess"
                defaultMessage='In case this link goes offline, you can <a href="{link}" target="_blank" rel="noopener noreferrer">access a backup on <b>{name}</b> via Keep</a>'
                values={{ link: archiveIsLink, name: archiverName }}
              />
            </span>
          );
        } else if (archiveIsResponse.error) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverError"
                defaultMessage="There was an error when Keep tried to archive this item to <b>{name}</b>. Refresh this media to try again."
                values={{ name: archiverName }}
              />
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverWait"
                defaultMessage="This item is being archived to <b>{name}</b> by Keep. Come back in a few minutes to receive a confirmation link."
                values={{ name: archiverName }}
              />
            </span>
          );
        }
      }

      if (object.field_name === 'embed_code_copied') {
        contentTemplate = (
          <span className="annotation__embed-code-copied">
            <FormattedMessage
              id="annotation.embedCodeCopied"
              defaultMessage="An embed code of the item has been generated and copied, so the item may now be publicly viewable."
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
                defaultMessage="There was an error when Keep tried to take a screenshot of this item. Refresh this media to try again."
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

      break;
    case 'create_flag':
      contentTemplate = (
        <span>
          <FormattedMessage
            id="annotation.flaggedHeader"
            defaultMessage="Flagged as {flag} by {author}"
            values={{ flag: content.flag, author: authorName }}
          />
        </span>
      );
      break;
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
              defaultMessage="Moved from project {previousProject} to {currentProject} by {author}"
              values={{
                previousProject: (
                  <Link to={urlPrefix + previousProject.dbid}>
                    <span>{previousProject.title}</span>
                  </Link>
                ),
                currentProject: (
                  <Link to={urlPrefix + currentProject.dbid}>
                    <span>{currentProject.title}</span>
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
              defaultMessage="Copied from project {previousProject} on team {previousTeam} by {author}"
              values={{
                previousProject: (
                  <Link to={previousProjectUrl + previousTeam.dbid}>
                    <span>{previousProject.title}</span>
                  </Link>
                ),
                previousTeam: (
                  <Link to={previousTeamUrl}>
                    <span>{previousTeam.name}</span>
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
      contentTemplate = shouldLogChange(activity) ?
        <TaskUpdate activity={activity} authorName={authorName} /> : null;
      break;
    default:
      contentTemplate = null;
      break;
    }

    if (contentTemplate === null) {
      return null;
    }

    const useCardTemplate = activityType === 'create_comment' || activityType === 'screenshot_taken';
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
              <CardText
                className={`annotation__card-text annotation__card-activity-${activityType.replace(
                  /_/g,
                  '-',
                )}`}
              >
                {authorName ?
                  <Tooltip placement="top" overlay={<UserTooltip user={activity.user} team={annotated.team} />}>
                    <StyledAvatarColumn isRtl={isRtl}>
                      <SourcePicture
                        className="avatar"
                        type="user"
                        size="small"
                        object={activity.user.source}
                      />
                    </StyledAvatarColumn>
                  </Tooltip> : null}

                <StyledPrimaryColumn isRtl={isRtl}>
                  {contentTemplate}
                  <StyledAnnotationMetadata isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
                    <span>
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

              </CardText>
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

export default injectIntl(Annotation);
