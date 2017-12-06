import React from 'react';
import { Link } from 'react-router';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import { HeaderTitle, FadeIn, SlideIn, black54 } from '../../styles/js/shared';

const ProjectHeader = (props) => {
  const currentProject = props.project;
  const path = props.location
    ? props.location.pathname
    : window.location.pathname;
  const regexProject = /(.*\/project\/[0-9]+)/;
  const regexMedia = /\/media\/[0-9]/;
  const backUrl = (regexMedia.test(path)) ? path.match(regexProject)[1] : null;
  const isProjectSubpage = regexMedia.test(path);

  return (
    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

      {isProjectSubpage
        ?
          <IconButton
            containerElement={<Link to={backUrl} />}
            className="project-header__back-button"
          >
            <FadeIn>
              <SlideIn>
                <IconArrowBack color={black54} />
              </SlideIn>
            </FadeIn>
          </IconButton>
        : null}
      <HeaderTitle>{currentProject.title}</HeaderTitle>
    </div>
  );
};

ProjectHeader.contextTypes = {
  store: React.PropTypes.object,
};

export default ProjectHeader;
