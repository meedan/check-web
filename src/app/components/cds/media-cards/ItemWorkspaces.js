import React from 'react';
import PropTypes from 'prop-types';
import TeamAvatar from '../../team/TeamAvatar';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import styles from './Card.module.css';

const ItemWorkspaces = ({
  workspaces,
}) => {
  if (!workspaces || workspaces.length === 0) {
    return null;
  }

  const maxWorkspaces = 5;
  const renderedWorkspaces = workspaces.slice(0, maxWorkspaces);
  const extraWorkspaces = workspaces.slice(maxWorkspaces, Infinity).map(workspace => <li>{workspace.name}</li>);

  return (
    <div className={styles.cardWorkspaces}>
      { renderedWorkspaces.map(workspace => (
        <Tooltip
          arrow
          title={workspace.name}
          key={workspace.name}
          placement="top"
        >
          <span>
            <TeamAvatar team={{ avatar: workspace.url }} size="30px" />
          </span>
        </Tooltip>
      )) }
      { extraWorkspaces.length > 0 ?
        <div className={styles.extraWorkspaces}>
          <Tooltip
            arrow
            title={<ul>{extraWorkspaces}</ul>}
            placement="right"
          >
            <span className="typography-body2">
              +{extraWorkspaces.length}
            </span>
          </Tooltip>
        </div>
        : null }
    </div>
  );
};

ItemWorkspaces.propTypes = {
  workspaces: PropTypes.array.isRequired,
};

export default ItemWorkspaces;
