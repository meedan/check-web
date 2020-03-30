import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { FormattedMessage } from 'react-intl';
import ProjectRoute from '../../relay/ProjectRoute';
import { urlFromSearchQuery } from '../search/Search';
import { Row, Text, HeaderTitle, FadeIn, SlideIn, black54 } from '../../styles/js/shared';
import CheckContext from '../../CheckContext';

class ProjectHeaderComponent extends React.PureComponent {
  getContext() {
    return new CheckContext(this);
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const { props } = this;
    const currentProject = props.project;
    const path = props.location ? props.location.pathname : window.location.pathname;
    const regexProject = /^(\/[^/]+\/project\/[0-9]+)/;
    const regexTeam = /^(\/[^/]+)/;
    const regexMedia = /project\/[0-9]+\/media\/[0-9]/;
    const regexSource = /\/source\/[0-9]/;
    let mediaQuery = null;
    const { state } = this.currentContext().history.getCurrentLocation();
    if (state && state.query) {
      mediaQuery = state.query;
    }
    const isProjectSubpage = regexMedia.test(path) || regexSource.test(path);

    const backUrl = () => {
      if (mediaQuery) {
        const query = Object.assign({}, mediaQuery);
        let basePath = '';
        switch (query.referer) {
        case 'search':
          basePath = `${path.match(regexTeam)[1]}/all-items`;
          break;
        case 'trash':
          basePath = `${path.match(regexTeam)[1]}/trash`;
          break;
        default:
          basePath = `${path.match(regexTeam)[1]}/all-items`;
          if (regexProject.test(path)) {
            basePath = `${path.match(regexProject)[1]}`;
          }
          break;
        }
        const baseQuery = query.original || query;
        baseQuery.esoffset = Math.floor(query.esoffset / 20) * 20;
        if (baseQuery.esoffset === 0) {
          delete baseQuery.esoffset;
        }
        return urlFromSearchQuery(baseQuery, basePath);
      } else if (isProjectSubpage) {
        return path.match(regexProject)[1];
      }
      return `${path.match(regexTeam)[1]}/all-items`;
    };

    const backLabel = () => {
      const allItems = <FormattedMessage id="projectHeader.allItems" defaultMessage="All items" />;
      if (mediaQuery) {
        switch (mediaQuery.referer) {
        case 'search':
          return allItems;
        case 'trash':
          return <FormattedMessage id="projectHeader.trash" defaultMessage="Trash" />;
        default:
        }
      }
      return currentProject ? currentProject.title : '';
    };

    const url = backUrl();
    const label = backLabel();

    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {url ?
          <Row>
            <Link to={url}>
              <IconButton className="project-header__back-button">
                <FadeIn>
                  <SlideIn>
                    <IconArrowBack color={black54} />
                  </SlideIn>
                </FadeIn>
              </IconButton>
            </Link>
            <HeaderTitle className="project-header__title" style={{ maxWidth: '100%' }}>
              <Text ellipsis>
                {label}
              </Text>
            </HeaderTitle>
          </Row>
          : null}
      </div>
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: PropTypes.object,
  router: PropTypes.object,
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
  } else if (props.params && props.params.mediaId) {
    return (<ProjectHeaderComponent
      {...props}
    />);
  }
  return null;
};

export default ProjectHeader;
