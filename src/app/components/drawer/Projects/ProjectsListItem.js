import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
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
  intl,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
      browserHistory.push(`/${teamSlug}/${routePrefix}/${project.dbid}${routeSuffix}`);
    }
  };

  const defaultClassName = ['project-list__link', className].join(' ');

  const Item = listItemProps => (
    <ListItem
      button
      onClick={handleClick}
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
      <ListItemSecondaryAction title={project.medias_count} className={styles.listItemCount}>
        <small>
          { !Number.isNaN(parseInt(project.medias_count, 10)) ?
            new Intl.NumberFormat(intl.locale, { notation: 'compact', compactDisplay: 'short' }).format(project.medias_count) : null }
        </small>
      </ListItemSecondaryAction>
    </ListItem>
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
  intl: intlShape.isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
};

export default injectIntl(ProjectsListItem);
