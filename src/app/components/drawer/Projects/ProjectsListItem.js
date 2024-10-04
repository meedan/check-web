import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import cx from 'classnames/bind';
import DrawerListCounter from './DrawerListCounter';
import styles from './Projects.module.css';

const ProjectsListItem = ({
  className,
  icon,
  isActive,
  onClick,
  project,
  routePrefix,
  routeSuffix,
  teamSlug,
  tooltip,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
    }
  };

  const Item = listItemProps => (
    <Link
      className={styles.linkList}
      to={`/${teamSlug}/${routePrefix}/${project.dbid}${routeSuffix}`}
      onClick={handleClick}
    >
      <li
        className={cx(
          'project-list__link',
          styles.listItem,
          styles.listItem_containsCount,
          {
            [className]: true,
            [styles.listItem_active]: isActive,
          })
        }
        key={`${project.id}-${project.title}`}
        title={tooltip}
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
        <DrawerListCounter numberOfItems={project.medias_count} />
      </li>
    </Link>
  );

  return <Item />;
};

ProjectsListItem.defaultProps = {
  className: '',
  icon: null,
  isActive: false,
  routeSuffix: '',
  tooltip: null,
  onClick: null,
};

ProjectsListItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node,
  isActive: PropTypes.bool,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string,
    name: PropTypes.string,
    medias_count: PropTypes.number,
    project_group_id: PropTypes.number,
  }).isRequired,
  routePrefix: PropTypes.string.isRequired,
  routeSuffix: PropTypes.string,
  teamSlug: PropTypes.string.isRequired,
  tooltip: PropTypes.node,
  onClick: PropTypes.func,
};

export default ProjectsListItem;
