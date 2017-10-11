import React, { Component, PropTypes } from 'react';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MappedMessage from '../MappedMessage';
import Relay from 'react-relay';
import Tooltip from 'rc-tooltip';
import MediaDetail from '../media/MediaDetail';
import MediaUtil from '../media/MediaUtil';
import DynamicAnnotation from '../annotations/DynamicAnnotation';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';
import DeleteVersionMutation from '../../relay/DeleteVersionMutation';
import UpdateProjectMediaMutation from '../../relay/UpdateProjectMediaMutation';
import Can, { can } from '../Can';
import TimeBefore from '../TimeBefore';
import ProfileLink from '../layout/ProfileLink';
import { Link } from 'react-router';
import { getStatus, getStatusStyle } from '../../helpers';
import Lightbox from 'react-image-lightbox';
import { Card, CardText } from 'material-ui/Card';
import MenuButton from '../MenuButton';
import MdImage from 'react-icons/lib/md/image';
import ParsedText from '../ParsedText';
import DatetimeTaskResponse from '../task/DatetimeTaskResponse';
import UserTooltip from '../user/UserTooltip';

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
    defaultMessage: 'This item contains at least one image. Click Search to look for potential duplicates on Google.',
  },
  reverseImageFacebook: {
    id: 'annotation.reverseImageFacebook',
    defaultMessage: 'This item contains at least one image. Consider a reverse image search.',
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

class Annotation extends Component {
  constructor(props) {
    super(props);

    this.state = { zoomedCommentImage: false, retriedKeep: false, disableMachineTranslation: false };
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
      let message = this.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
    };

    const onSuccess = (response) => {
    };

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

  handleUpdateMachineTranslation() {
    const onFailure = (transaction) => {
      const transactionError = transaction.getError();
      transactionError.json ? transactionError.json().then(handleError) : handleError(JSON.stringify(transactionError));
    };

    const onSuccess = (response) => {
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

  handleRetryKeep() {
    const onFailure = (transaction) => {
      this.setState({ retriedKeep: false });
    };

    const onSuccess = (response) => {};

    if (!this.state.retriedKeep) {
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          update_keep: 1,
          id: this.props.annotated.id,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ retriedKeep: true });
    }
  }

  handleReverseImageSearch(path) {
    const imagePath = path ? `?&image_url=${path}` : '';
    window.open(`https://www.google.com/searchbyimage${imagePath}`);
  }

  render() {
    const activity = this.props.annotation;
    const annotation = activity.annotation;
    const annotated = this.props.annotated;

    let annotationActions = null;
    if (annotation) {
      const permission = `destroy ${annotation.annotation_type.charAt(0).toUpperCase()}${annotation.annotation_type.slice(1)}`;
      annotationActions = can(annotation.permissions, permission) ? (
        <MenuButton>
          <Can permissions={annotation.permissions} permission={permission}>
            <li className="annotation__delete" onClick={this.handleDelete.bind(this, annotation.id)}>
              <span>{this.props.intl.formatMessage(messages.deleteButton)}</span>
            </li>
          </Can>
        </MenuButton>
      ) : null;
    }

    const updatedAt = MediaUtil.createdAt({ published: activity.created_at });
    const timestamp = updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null;
    const authorName = activity.user ? <Link to={`/check/user/${activity.user.dbid}`} className={'annotation__author-name'}>{activity.user.name}</Link> : null;
    const object = JSON.parse(activity.object_after);
    const content = object.data;
    let activityType = activity.event_type;
    let contentTemplate = null;

    switch (activityType) {
    case 'create_comment':
      const commentText = content.text;
      const commentContent = JSON.parse(annotation.content);
      contentTemplate = (
        <div>
          <div className="annotation__card-content">
            <ParsedText text={commentText} />
            {/* thumbnail */ }
            { commentContent.original ?
              <img src={commentContent.thumbnail} className="annotation__card-thumbnail" alt="" onClick={this.handleOpenCommentImage.bind(this, commentContent.original)} />
            : null }
          </div>

          {/* embedded medias */ }
          <div className="annotation__card-embedded-medias">
            {annotation.medias.edges.map(media => (
              <div><MediaDetail media={media.node} condensed readonly /></div>
          ))}
          </div>

          {/* lightbox */ }
          { (commentContent.original && !!this.state.zoomedCommentImage) ?
            <Lightbox onCloseRequest={this.handleCloseCommentImage.bind(this)} mainSrc={this.state.zoomedCommentImage} />
          : null }
        </div>
      );
      break;
    case 'update_status':
      const statusCode = content.status.toLowerCase().replace(/[ _]/g, '-');
      const status = getStatus(this.props.annotated.verification_statuses, content.status);
      contentTemplate = (<span>
        <FormattedMessage
          id="annotation.statusSetHeader"
          defaultMessage={'Status set to {status} by {author}'}
          values={{ status: <span className={`annotation__status annotation__status--${statusCode}`} style={{ color: getStatusStyle(status, 'color') }}>{status.label}</span>, author: authorName }}
        />
      </span>);
      break;
    case 'create_tag':
      contentTemplate = (<span>
        <FormattedMessage
          id="annotation.taggedHeader"
          defaultMessage={'Tagged #{tag} by {author}'}
          values={{ tag: content.tag.replace(/^#/, ''), author: authorName }}
        />
      </span>);
      break;
    case 'destroy_comment':
      contentTemplate = (<em className="annotation__deleted">
        <FormattedMessage
          id="annotation.deletedComment"
          defaultMessage={'Comment deleted by {author}: "{comment}"'}
          values={{
            author: authorName,
            comment: content.text
          }}
        />
      </em>);
      break;
    case 'create_task':
      contentTemplate = (<span>
        <FormattedMessage
          id="annotation.taskCreated"
          defaultMessage={'Task "{task}" created by {author}'}
          values={{ task: content.label, author: authorName }}
        />
      </span>);
      break;
    case 'create_dynamicannotationfield': case 'update_dynamicannotationfield':
      if (/^response_/.test(object.field_name) && activity.task) {
        const format_response = (type) => {
          if (type === 'multiple_choice') {
            const response_obj = JSON.parse(object.value);
            const selected_array = response_obj.selected || [];
            if (response_obj.other) { selected_array.push(response_obj.other); }
            const last_item = selected_array.length > 1 ? ` ${this.props.intl.formatMessage(messages.and)} ${selected_array.splice(-1, 1)}` : '';
            return (selected_array.join(', ') + last_item);
          } else if (type === 'geolocation') {
            const geojson = JSON.parse(object.value);
            const coordinates = geojson.geometry.coordinates;
            const name = geojson.properties.name;
            if (coordinates[0] != 0 || coordinates[1] != 0) {
              return (<a style={{ textDecoration: 'underline' }} href={`http://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}&zoom=12#map=12/${coordinates[0]}/${coordinates[1]}`} target="_blank" rel="noreferrer noopener">{name}</a>);
            }

            return name;
          } else if (type === 'datetime') {
            return (<DatetimeTaskResponse response={object.value} />);
          }
          return (<ParsedText text={object.value} />);
        };
        contentTemplate = (<span className="// annotation__task-resolved">
          <FormattedMessage
            id="annotation.taskResolve"
            defaultMessage={'Task "{task}" answered by {author}: "{response}"'}
            values={{ task: activity.task.label, author: authorName, response: format_response(activity.task.type) }}
          />
        </span>);
      }

      if (object.field_name === 'reverse_image_path') {
        const [reverseImage, value] = (annotated.domain === 'facebook.com') ? [messages.reverseImageFacebook, null] : [messages.reverseImage, object.value];
        contentTemplate = (<span className="annotation__reverse-image">
          <MdImage /> <span>{this.props.intl.formatMessage(reverseImage)}</span>
          <span className="annotation__reverse-image-search" title="Google Images" onClick={this.handleReverseImageSearch.bind(this, value)}><FormattedMessage id="annotation.reverseImageSearch" defaultMessage="Search" /></span>
        </span>);
      }

      if (object.field_name === 'translation_text') {
        const translationContent = JSON.parse(annotation.content);
        let language = translationContent.find(it => it.field_name === 'translation_language');
        language = (language && language.formatted_value) || '?';
        contentTemplate = (<span className="annotation__translation-text">
          <FormattedMessage
            id="annotation.translation" defaultMessage={'Translated to {language} by {author}: "{translation}"'}
            values={{ language, author: authorName, translation: <ParsedText text={object.value} /> }}
          />
        </span>);
      }

      if (object.field_name === 'mt_translations') {
        const formatted_value = JSON.parse(annotation.content)[0].formatted_value;
        if (formatted_value.length == 0) {
          contentTemplate = (<span className="annotation__mt-translations">
            <button className="annotation__mt-translations" onClick={this.handleUpdateMachineTranslation.bind(this)} disabled={this.state.disableMachineTranslation}>
              <FormattedMessage id="annotation.emptyMachineTranslation" defaultMessage="Add machine translation" />
            </button>
          </span>);
        } else {
          contentTemplate = (<span className="annotation__mt-translations">
            <ul className="mt-list">
              {formatted_value.map(mt => (
                <li className="mt__list-item">
                  <FormattedMessage
                    id="annotation.machineTranslation"
                    defaultMessage={'Machine translation for "{lang}" is: {text}'}
                    values={{ lang: mt.lang_name, text: mt.text }}
                  />
                </li>
            ))}
            </ul>
          </span>);
        }
      }

      if (object.field_name === 'translation_status_status') {
        const statusCode = object.value.toLowerCase().replace(/[ _]/g, '-');
        const status = getStatus(this.props.annotated.translation_statuses, object.value);
        contentTemplate = (<span>
          <FormattedMessage
            id="annotation.translationStatus"
            defaultMessage={'Translation status set to {status} by {author}'}
            values={{ status: <span className={`annotation__status annotation__status--${statusCode}`}>{status.label}</span>,
              author: authorName }}
          />
        </span>);
      }

      if (object.field_name === 'translation_published') {
        const published = JSON.parse(object.value);
        const colors = {
          twitter: '#4099FF',
          facebook: '#3b5998',
        };
        contentTemplate = [];
        for (const provider in published) {
          const name = provider.charAt(0).toUpperCase() + provider.slice(1);
          const color = colors[provider] || '#333';
          contentTemplate.push(
            <span>
              <FormattedMessage
                id="annotation.translationPublished" defaultMessage={'Translation published to {link}'}
                values={{ link: <a style={{ color, fontWeight: 'bold' }} href={published[provider]} target="_blank" rel="noreferrer noopener">{name}</a> }}
              />
            </span>,
          );
        }
      }

      if (object.field_name === 'keep_backup_response') {
        const keep = JSON.parse(JSON.parse(annotation.content)[0].value);
        const keepLink = keep.location;
        const keepStatus = parseInt(keep.status);
        contentTemplate = null;
        if (this.state.retriedKeep) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.keepRetried"
                defaultMessage={'There is a new attempt to archive this item in Keep. Please check back in an hour.'}
              />
            </span>
          );
        } else if (keepLink) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.keepSuccess"
                defaultMessage={'In case this link goes offline, you can <a href="{keepLink}" target="_blank" rel="noopener noreferrer">access a backup via Keep</a>'}
                values={{ keepLink }}
              />
            </span>
          );
        } else if (keepStatus === 418) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.keepError"
                defaultMessage={'There was an error when Keep tried to archive this item'}
              />
              <span className="annotation__keep-retry" onClick={this.handleRetryKeep.bind(this)}>
                <FormattedMessage id="annotation.keepRetry" defaultMessage="Retry" />
              </span>
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.keepWait"
                defaultMessage={'This item is being archived in Keep. Come back in an hour to receive a confirmation link.'}
              />
            </span>
          );
        }
      }

      if (object.field_name === 'embed_code_copied') {
        contentTemplate = (<span className="annotation__embed-code-copied"><strong>
          <FormattedMessage
            id="annotation.embedCodeCopied"
            defaultMessage={'An embed code of the item has been generated and copied, so the item may now be publicly viewable.'}
          />
        </strong></span>);
      }

      break;
    case 'create_flag':
      contentTemplate = (<span>
        <FormattedMessage
          id="annotation.flaggedHeader"
          defaultMessage={'Flagged as {flag} by {author}'}
          values={{ flag: content.flag, author: authorName }}
        />
      </span>);
      break;
    case 'update_embed': case 'create_embed':
      if (content.title) {
        if (annotated.quote && annotated.quote === content.title) {
          const reportType = MediaUtil.typeLabel(annotated, content, this.props.intl).toLowerCase();
          contentTemplate = (<span>
            <FormattedMessage
              id="annotation.newReport"
              defaultMessage={'New {reportType} added by {author}'}
              values={{ reportType, author: authorName }}
            />
          </span>);
        } else {
          contentTemplate = (<span>
            <FormattedMessage
              id="annotation.titleChanged"
              defaultMessage={'Title changed to {title} by {author}'}
              values={{ title: <span>{content.title}</span>, author: authorName }}
            />
          </span>);
        }
      }
      break;
    case 'update_projectmedia':
      if (activity.projects.edges.length > 0 && activity.user) {
        const previousProject = activity.projects.edges[0].node;
        const currentProject = activity.projects.edges[1].node;
        const urlPrefix = `/${annotated.team.slug}/project/`;
        contentTemplate = (<span>
          <FormattedMessage
            id="annotation.projectMoved"
            defaultMessage={'Moved from project {previousProject} to {currentProject} by {author}'}
            values={{
              previousProject: <Link to={urlPrefix + previousProject.dbid}><span>{previousProject.title}</span></Link>,
              currentProject: <Link to={urlPrefix + currentProject.dbid}><span>{currentProject.title}</span></Link>,
              author: authorName,
            }}
          />
        </span>);
      }
      else if (activity.object_changes_json == '{"archived":[false,true]}') {
        activityType = 'move_to_trash';
        contentTemplate = (<div>
          <div className="annotation__card-content annotation__card-trash">
            <FormattedMessage id="annotation.movedToTrash" defaultMessage="Moved to trash" />
          </div>
        </div>);
      }
      else if (activity.object_changes_json == '{"archived":[true,false]}') {
        contentTemplate = (<span>
          <FormattedMessage
            id="annotation.movedFromTrash"
            defaultMessage={'{author} moved this out of the trash'}
            values={{
              author: authorName
            }}
          />
        </span>);
      }
      break;
    case 'update_task':
      const changes = JSON.parse(activity.object_changes_json);
      if (changes.data) {
        const from = changes.data[0];
        const to = changes.data[1];
        let editedTitle = false;
        let editedNote = false;
        let createdNote = false;
        if (from.label && to.label && from.label != to.label) {
          editedTitle = true;
        }
        if (to.description && from.description != to.description) {
          editedNote = true;
        }
        if (!from.description && to.description) {
          editedNote = false;
          createdNote = true;
        }
        const author = authorName;
        if (editedTitle || editedNote || createdNote) {
          contentTemplate = (<span>
            <span className="// annotation__update-task" />
            { editedTitle ? <FormattedMessage id="annotation.taskLabelUpdated" defaultMessage={'Task "{from}" edited to "{to}" by {author}'} values={{ from: from.label, to: to.label, author }} /> : null }
            { editedNote ? <FormattedMessage id="annotation.taskNoteUpdated" defaultMessage={'Task "{title}" has note edited from "{from}" to "{to}" by {author}'} values={{ title: to.label, from: from.description, to: to.description, author }} /> : null }
            { createdNote ? <FormattedMessage id="annotation.taskNoteCreated" defaultMessage={'Task "{title}" has new note "{note}" by {author}'} values={{ title: to.label, note: to.description, author }} /> : null }
          </span>);
        }
      }
      break;
    default:
      contentTemplate = null;
      break;
    }

    if (contentTemplate === null) {
      return null;
    }

    const useCardTemplate = (activityType === 'create_comment' || activityType === 'move_to_trash');
    const templateClass = `annotation--${useCardTemplate ? 'card' : 'default'}`;
    const typeClass = annotation ? `annotation--${annotation.annotation_type}` : '';
    return (
      <section className={`annotation ${templateClass} ${typeClass}`} id={`annotation-${activity.dbid}`}>
        {useCardTemplate ? (
          <Card className="annotation__card">
            <CardText className={`annotation__card-text annotation__card-activity-${activityType.replace(/_/g, '-')}`}>
              <div className="annotation__card-avatar-col">
                <Tooltip placement="top" overlay={<UserTooltip user={activity.user}/>}>
                  <div className="annotation__card-avatar" style={{ backgroundImage: `url(${activity.user.source.image})` }} />
                </Tooltip>
              </div>
              <div className="annotation__card-main-col">
                {contentTemplate}
                <footer className="annotation__card-footer">
                  <span className="annotation__card-footer-text">
                    <Link to={`/check/user/${activity.user.dbid}`} className={'annotation__card-author'}>{activity.user.name}</Link><span>{timestamp}</span>
                  </span>
                  {annotationActions}
                </footer>
              </div>

            </CardText>
          </Card>
          ) : (
            <div className="annotation__default">
              <span className="annotation__default-text">
                <span className="annotation__default-content">{contentTemplate}</span>
                {timestamp}
              </span>
            </div>
          )
        }
      </section>
    );
  }
}

Annotation.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Annotation);
