/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import cx from 'classnames/bind';
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
    project_group_id: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  tooltip: PropTypes.node,
};

export default ProjectsListItem;
