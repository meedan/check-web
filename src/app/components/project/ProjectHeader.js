import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import ProjectRoute from '../../relay/ProjectRoute';
import { searchQueryFromUrlQuery, urlFromSearchQuery } from '../search/Search';
import { HeaderTitle, FadeIn, SlideIn, black54 } from '../../styles/js/shared';

const ProjectHeaderComponent = (props) => {
  const currentProject = props.project;
  const path = props.location ? props.location.pathname : window.location.pathname;
  const regexProject = /(.*\/project\/[0-9]+)/;
  const regexMedia = /\/media\/[0-9]/;
  const regexSource = /\/source\/[0-9]/;
  const regexFilteredMedia = /^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+\/(.+)/;
  const isProjectSubpage = regexMedia.test(path) || regexSource.test(path);
  const backUrl = () => {
    if (regexFilteredMedia.test(path)) {
      const query = searchQueryFromUrlQuery(path.match(regexFilteredMedia)[1]);
      delete query.esoffset;
      return urlFromSearchQuery(query, path.match(regexProject)[1]);
    } else if (isProjectSubpage) {
      return path.match(regexProject)[1];
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {isProjectSubpage ?
        <IconButton
          containerElement={<Link to={backUrl()} />}
          className="project-header__back-button"
        >
          <FadeIn>
            <SlideIn>
              <IconArrowBack color={black54} />
            </SlideIn>
          </FadeIn>
        </IconButton>
        : null}
      <HeaderTitle className="project-header__title">
        {currentProject.title}
      </HeaderTitle>
    </div>
  );
};

ProjectHeaderComponent.contextTypes = {
  store: PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        title,
        description
      }
    `,
  },
});

const ProjectHeader = (props) => {
  if (props.params && props.params.projectId) {
    const route = new ProjectRoute({ contextId: props.params.projectId });
    return (<Relay.RootContainer
      Component={ProjectHeaderContainer}
      route={route}
    />);
  }
  return null;
};

export default ProjectHeader;
