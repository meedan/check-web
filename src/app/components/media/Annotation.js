import React, { Component, PropTypes } from 'react';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Linkify from 'react-linkify';
import nl2br from 'react-nl2br';
import MediaDetail from './MediaDetail';
import DynamicAnnotation from '../annotations/DynamicAnnotation';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';
import DeleteVersionMutation from '../../relay/DeleteVersionMutation';
import Can, { can } from '../Can';
import TimeBefore from '../TimeBefore';
import { Link } from 'react-router';
import { getStatus, getStatusStyle } from '../../helpers';
import Lightbox from 'react-image-lightbox';
import { Card, CardText } from 'material-ui/Card';
import MenuButton from '../MenuButton';
import { MdImage } from 'react-icons/lib/md';

const messages = defineMessages({
  error: {
    id: 'annotation.error',
    defaultMessage: 'Could not delete annotation',
  },
  deleteButton: {
    id: 'annotation.deleteButton',
    defaultMessage: 'Delete',
  },
  reverseImageTooltip: {
    id: 'annotation.reverseImageTooltip',
    defaultMessage: 'Search Google for potential duplicates on the web.',
  },
});

class Annotation extends Component {
  constructor(props) {
    super(props);

    this.state = { zoomedCommentImage: false };
  }

  handleCloseCommentImage() {
    this.setState({ zoomedCommentImage: false });
  }

  handleOpenCommentImage(image) {
    this.setState({ zoomedCommentImage: image });
  }

  handleDelete(id) {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      window.alert(message);
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

  updatedAt(activity) {
    let date = new Date(activity.created_at);
    if (isNaN(date)) date = null;
    return date;
  }

  profileLink(user){
    let url = user.email ? 'mailto:' + user.email : '';

    if (user && user.source && user.source.accounts && user.source.accounts.edges && user.source.accounts.edges.length > 0){
      url = user.source.accounts.edges[0].node.url;
    }

    return url ?
        <a target="_blank" rel="noopener noreferrer" className="annotation__author-name" href={url}>{user.name}</a> :
        <span className="annotation__author-name">{user.name}</span>;
  }

  handleReverseImageSearch(imagePath) {
    window.open('https://www.google.com/searchbyimage?&image_url=' + imagePath);
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
            <li className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)}>
              <span>{this.props.intl.formatMessage(messages.deleteButton)}</span>
            </li>
          </Can>
        </MenuButton>
      ) : null;
    }

    const updatedAt = this.updatedAt(activity);
    const timestamp = updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt}/></span> : null;
    const authorName = this.profileLink(activity.user);
    const object = JSON.parse(activity.object_after);
    const content = object.data;
    const activityType = activity.event_type;
    let contentTemplate = null;

    switch (activityType) {
    case 'create_comment':
      const commentText = content.text;
      const commentContent = JSON.parse(annotation.content);
      contentTemplate = (<div className='annotation__card-content'>
        <Linkify properties={{ target: '_blank' }}>{nl2br(commentText)}</Linkify>
        {/* thumbnail */ }
        { commentContent.original ?
          <img src={commentContent.thumbnail} className='annotation__card-thumbnail' alt="" onClick={this.handleOpenCommentImage.bind(this, commentContent.original)} />
        : null }
        {/* embedded medias */ }
        {annotation.medias.edges.map(media => (
          <div><MediaDetail media={media.node} condensed readonly /></div>
        ))}
        {/* lightbox */ }
        { (commentContent.original && !!this.state.zoomedCommentImage) ?
          <Lightbox onCloseRequest={this.handleCloseCommentImage.bind(this)} mainSrc={this.state.zoomedCommentImage} />
        : null }
      </div>);
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
        contentTemplate = (<span className="// annotation__task-resolved">
          <FormattedMessage
            id="annotation.taskResolve"
            defaultMessage={'Task "{task}" answered by {author}: {response}'}
            values={{ task: activity.task.label, author: authorName, response: <span>{`"${object.value}"`}</span> }}
          />
        </span>);
      }
      if (object.field_name === 'reverse_image_path') {
        contentTemplate = (<span className="annotation__reverse-image">
          <MdImage /> <FormattedMessage id="annotation.reverseImage" defaultMessage={'Media contains one image. Click Search to look for duplicates on Google.'} />
          <span className="annotation__reverse-image-search" title={this.props.intl.formatMessage(messages.reverseImageTooltip)} onClick={this.handleReverseImageSearch.bind(this, object.value)}><FormattedMessage id="annotation.reverseImageSearch" defaultMessage="Search" /></span>
        </span>);
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
          contentTemplate = (<span>
            <FormattedMessage
              id="annotation.newClaim"
              defaultMessage={'New claim added by {author}'}
              values={{ author: authorName }}
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
            <span className="// annotation__update-task"></span>
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

    const useCardTemplate = activityType === 'create_comment';
    const templateClass = `annotation--${useCardTemplate ? 'card' : 'default'}`;
    const typeClass = annotation ? `annotation--${annotation.annotation_type}` : '';
    return (
      <section className={`annotation ${templateClass} ${typeClass}`} id={`annotation-${activity.dbid}`}>
        {useCardTemplate ? (
            <Card className='annotation__card'>
              <CardText className='annotation__card-text'>
                <div className='annotation__card-avatar-col'>
                  <div className='annotation__card-avatar' style={{ backgroundImage: `url(${activity.user.profile_image})` }} />
                </div>
                <div className='annotation__card-main-col'>
                  {contentTemplate}
                  <footer className='annotation__card-footer'>
                    <span className='annotation__card-footer-text'>
                      <span className='annotation__card-author'>{activity.user.name}</span> <span>{timestamp}</span>
                    </span>
                    {annotationActions}
                  </footer>
                </div>

              </CardText>
            </Card>
          ) : (
            <div className='annotation__default'>
              <span className='annotation__default-text'>
                <span className='annotation__default-content'>{contentTemplate}</span>
                {timestamp}
              </span>
              {annotationActions}
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
