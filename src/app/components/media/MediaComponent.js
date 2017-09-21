import React, { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { stripUnit } from 'polished';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaUtil from './MediaUtil';
import Annotations from '../annotations/Annotations';
import CheckContext from '../../CheckContext';
import Tasks from '../task/Tasks';
import CreateTask from '../task/CreateTask';
import {
  getStatus,
  getStatusStyle,
} from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { ContentColumn, headerHeight, transitionSpeedSlow, gutterMedium, units, FlexRow, subheading2, body1, black87, black54, black16, mediaQuery } from '../../styles/js/shared';

const StyledTaskHeaderRow = styled.div`
  justify-content: space-between;
  padding-top: ${units(5)};
  display: flex;
  color: ${black54};
  font: ${body1};

  h2 {
    color: ${black87};
    flex: 1;
    font: ${subheading2};
    margin: 0;
  }

  .create-task {
    align-self: center;
    color: ${black16};
    cursor: pointer;
  }
`;

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  ${mediaQuery.desktop`
    display: flex;
    justify-content: center;
    max-width: ${units(120)};
    padding: 0;
    flex-direction: row;

    .media__media-column {
      max-width: ${units(150)} !important;
    }

    .media__annotations-column {
      max-width: ${units(50)};
    }
  `}
`;

const StyledBackgroundColor = styled.div`
  margin-top: -${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  padding-bottom: ${units(6)};
  padding-top: ${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  transition: background-color ${transitionSpeedSlow} ease;
  min-height: 100vh;
  z-index: -1;
`;

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
        data-id={media.dbid}
      >
        <StyledBackgroundColor
          className="media"
          style={{
            backgroundColor: getStatusStyle(status, 'backgroundColor'),
          }}
        >

          <StyledTwoColumnLayout>
            <ContentColumn>
              <MediaDetail borderColor="transparent" initiallyExpanded media={media} />
              {this.props.extras}
              <StyledTaskHeaderRow>
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
                        { media.tasks.edges.filter(
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
              </StyledTaskHeaderRow>
              <Tasks tasks={media.tasks.edges} media={media} />
            </ContentColumn>
            <ContentColumn className="media__annotations-column">
              <Annotations
                annotations={media.log.edges}
                annotated={media}
                annotatedType="ProjectMedia"
              />
            </ContentColumn>
          </StyledTwoColumnLayout>
        </StyledBackgroundColor>
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
