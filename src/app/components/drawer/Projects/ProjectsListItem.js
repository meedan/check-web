import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
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
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
    }
  };

  const defaultClassName = ['project-list__link', className].join(' ');

  const Item = listItemProps => (
    <Link
      onClick={handleClick}
      className={styles.linkList}
      to={`/${teamSlug}/${routePrefix}/${project.dbid}${routeSuffix}`}
    >
      <ListItem
        title={project.title}
        key={`${project.id}-${project.title}`}
        className={[
          defaultClassName,
          styles.listItem,
          styles.listItem_containsCount,
          isActive ? styles.listItem_active : '',
        ].join(' ')}
        {...listItemProps}
      >
        {icon}
        <ListItemText
          disableTypography
          className={[
            styles.listLabel,
            !icon ? styles.listLabel_plainText : '',
          ].join(' ')}
        >
          <span>
            {project.title || project.name}
          </span>
        </ListItemText>
        <ProjectsListCounter numberOfItems={project.medias_count} />
      </ListItem>
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
};

export default ProjectsListItem;
