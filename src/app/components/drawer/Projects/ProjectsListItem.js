import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import cx from 'classnames/bind';
import ProjectsListCounter from './ProjectsListCounter';
import styles from './Projects.module.css';

const ProjectsListItem = ({
  onClick,
  isActive,
  className,
  teamSlug,
  project,
  icon,
  routePrefix,
  routeSuffix,
  tooltip,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
    }
  };

  const Item = listItemProps => (
    <Link
      onClick={handleClick}
      className={styles.linkList}
      to={`/${teamSlug}/${routePrefix}/${project.dbid}${routeSuffix}`}
    >
      <li
        title={tooltip}
        key={`${project.id}-${project.title}`}
        className={cx(
          'project-list__link',
          styles.listItem,
          styles.listItem_containsCount,
          {
            [className]: true,
            [styles.listItem_active]: isActive,
          })
        }
        {...listItemProps}
      >
        {icon}
        <div
          className={cx(
            styles.listLabel,
            {
              [styles.listLabel_plainText]: !icon,
            })
          }
        >
          <span>
            {project.title || project.name}
          </span>
        </div>
        <ProjectsListCounter numberOfItems={project.medias_count} />
      </li>
    </Link>
  );

  return <Item />;
};

ProjectsListItem.defaultProps = {
  icon: null,
  onClick: null,
  isActive: false,
  className: '',
  routeSuffix: '',
  tooltip: null,
};

ProjectsListItem.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  icon: PropTypes.node,
  routePrefix: PropTypes.string.isRequired,
  routeSuffix: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string,
    name: PropTypes.string,
    medias_count: PropTypes.number,
    project_group_id: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  tooltip: PropTypes.element,
};

export default ProjectsListItem;
