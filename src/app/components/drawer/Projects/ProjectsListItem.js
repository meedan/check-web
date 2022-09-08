import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { injectIntl, intlShape } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import RootRef from '@material-ui/core/RootRef';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { brandSecondary } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  projectsListItemLabel: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  projectsListItemActive: {
    background: brandSecondary,
  },
  projectsListItemActiveText: {
    fontWeight: 'bold',
  },
  projectsListItemIcon: {
    minWidth: theme.spacing(4),
  },
}));

const ProjectsListItem = ({
  index,
  onClick,
  isActive,
  isDroppable,
  isDraggable,
  className,
  teamSlug,
  project,
  icon,
  routePrefix,
  routeSuffix,
  intl,
}) => {
  const classes = useStyles();

  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, project.dbid);
    }
  };

  const defaultClassName = ['project-list__link', className].join(' ');

  const Item = listItemProps => (
    <Link className="link__internal" to={`/${teamSlug}/${routePrefix}/${project.dbid}${routeSuffix}`}>
      <ListItem
        button
        onClick={handleClick}
        title={project.title}
        key={`${project.id}-${project.title}`}
        className={isActive ? [classes.projectsListItemActive, defaultClassName].join(' ') : defaultClassName}
        {...listItemProps}
      >
        <ListItemIcon className={classes.projectsListItemIcon}>
          {icon}
        </ListItemIcon>
        <ListItemText classes={{ primary: classes.projectsListItemLabel }}>
          <span className={isActive ? classes.projectsListItemActiveText : ''}>
            {project.title || project.name}
          </span>
        </ListItemText>
        <ListItemSecondaryAction title={project.medias_count}>
          { !Number.isNaN(parseInt(project.medias_count, 10)) ?
            new Intl.NumberFormat(intl.locale, { notation: 'compact', compactDisplay: 'short' }).format(project.medias_count) : null }
        </ListItemSecondaryAction>
      </ListItem>
    </Link>
  );

  const droppableId = `droppable-${routePrefix}-${project.dbid}-${project.project_group_id}`;

  if (isDroppable) {
    return (
      <Droppable droppableId={droppableId}>
        {provided => (
          <RootRef rootRef={provided.innerRef}>
            <div>
              <Item />
              <div style={{ display: 'none' }}>
                {provided.placeholder}
              </div>
            </div>
          </RootRef>
        )}
      </Droppable>
    );
  }

  if (isDraggable) {
    return (
      <Droppable droppableId={droppableId}>
        {provided => (
          <RootRef rootRef={provided.innerRef}>
            <div>
              <Draggable key={project.dbid} draggableId={`draggable-${routePrefix}-${project.id}-${project.project_group_id}`} index={index}>
                {provided2 => (
                  <Item
                    ContainerComponent="li"
                    ContainerProps={{ ref: provided2.innerRef }}
                    {...provided2.draggableProps}
                    {...provided2.dragHandleProps}
                  />
                )}
              </Draggable>
              {provided.placeholder}
            </div>
          </RootRef>
        )}
      </Droppable>
    );
  }

  return <Item />;
};

ProjectsListItem.defaultProps = {
  index: null,
  onClick: null,
  isActive: false,
  className: '',
  isDroppable: false,
  isDraggable: false,
  routeSuffix: '',
};

ProjectsListItem.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  routePrefix: PropTypes.string.isRequired,
  routeSuffix: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    medias_count: PropTypes.number,
    project_group_id: PropTypes.number,
  }).isRequired,
  intl: intlShape.isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  isDroppable: PropTypes.bool,
  isDraggable: PropTypes.bool,
  index: PropTypes.number,
};

export default injectIntl(ProjectsListItem);
