import React, { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaUtil from './MediaUtil';
import Annotations from '../annotations/Annotations';
import CheckContext from '../../CheckContext';
import Tasks from '../task/Tasks';
import CreateTask from '../task/CreateTask';
import {
  bemClass,
  bemClassFromMediaStatus,
  getStatus,
  getStatusStyle,
} from '../../helpers';
import ContentColumn from '../layout/ContentColumn';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { units, FlexRow } from '../../styles/js/variables';

class MediaComponent extends Component {
  componentDidMount() {
    this.setCurrentContext();
    this.scrollToAnnotation();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setCurrentContext();
    this.scrollToAnnotation();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  setCurrentContext() {
    const project = this.getContext().project;
    if (project && project.dbid) {
      this.props.relay.setVariables({ contextId: project.dbid });
    }
  }

  scrollToAnnotation() {
    if (window.location.hash !== '') {
      const id = window.location.hash.replace(/^#/, '');
      const element = document.getElementById(id);
      if (element.scrollIntoView !== undefined) {
        element.scrollIntoView();
      }
    }
  }

  subscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      const that = this;
      pusher
        .subscribe(this.props.media.pusher_channel)
        .bind('media_updated', (data) => {
          const annotation = JSON.parse(data.message);
          if (annotation.annotated_id === that.props.media.dbid) {
            that.props.relay.forceFetch();
          }
        });
    }
  }

  unsubscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  render() {
    if (this.props.relay.variables.contextId === null) {
      return null;
    }

    const media = this.props.media;
    const data = JSON.parse(media.embed);
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;
    const status = getStatus(mediaStatuses(media), mediaLastStatus(media));

    return (
      <PageTitle
        prefix={MediaUtil.title(media, data, this.props.intl)}
        skipTeam={false}
        team={this.getContext().team}
      >
        <div
          className={bemClass('media', media.tasks.edges.length, '--has-tasks')}
          data-id={media.dbid}
        >
          <div
            className={bemClassFromMediaStatus(
              'media__expanded',
              mediaLastStatus(media),
            )}
            style={{
              backgroundColor: getStatusStyle(status, 'backgroundColor'),
            }}
          >

            <ContentColumn
              style={{ maxWidth: units(120) }}
              className="media__expanded-column-wrapper"
            >
              <ContentColumn className="media__media-column">
                <MediaDetail initiallyExpanded media={media} />
                {this.props.extras}
                <FlexRow
                  className="media__tasks-header"
                  style={{
                    justifyContent: 'space-between',
                    paddingTop: units(5),
                  }}
                >

                  {media.tasks.edges.length
                    ? <FlexRow>
                      <h2>
                        <FormattedMessage
                          id="mediaComponent.verificationTasks"
                          defaultMessage="Verification tasks"
                        />
                      </h2>
                        &nbsp;
                      <FlexRow>
                        {
                            media.tasks.edges.filter(
                              t => !!t.node.first_response,
                            ).length
                          }/{media.tasks.edges.length}&nbsp;
                        <FormattedMessage
                          id="mediaComponent.resolved"
                          defaultMessage="resolved"
                        />
                      </FlexRow>
                    </FlexRow>
                    : null}
                  <CreateTask style={{ marginLeft: 'auto' }} media={media} />
                </FlexRow>
                <Tasks tasks={media.tasks.edges} media={media} />
              </ContentColumn>
              <ContentColumn className="media__annotations-column">
                <Annotations
                  annotations={media.log.edges}
                  annotated={media}
                  annotatedType="ProjectMedia"
                />
              </ContentColumn>
            </ContentColumn>
          </div>
        </div>
      </PageTitle>
    );
  }
}

MediaComponent.propTypes = {
  intl: intlShape.isRequired,
};

MediaComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaComponent);
