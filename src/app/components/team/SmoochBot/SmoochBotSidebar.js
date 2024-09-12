import React from 'react';
import PropTypes from 'prop-types';
import { labels } from './localizables';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import smoochBotStyles from './SmoochBot.module.css';

const SmoochBotSidebar = ({
  currentOption,
  onClick,
  resources,
  userRole,
}) => {
  const handleClick = (option) => {
    onClick(option);
  };

  const Option = ({ className, id, label }) => {
    if (id === 'smooch_settings' && userRole !== 'admin') {
      return null;
    }

    return (
      <li
        className={className}
      >
        <ButtonMain
          className={smoochBotStyles.smoochBotMenuButton}
          key={id}
          label={label}
          size="default"
          theme="black"
          variant={currentOption === id ? 'contained' : 'text'}
          onClick={() => { handleClick(id); }}
        />
      </li>
    );
  };

  return (
    <ul className={smoochBotStyles.smoochBotMenu}>
      {/* Menu options */}
      { Object.keys(labels).map((key) => {
        const label = labels[key];
        return <Option id={key} key={key} label={label} />;
      })}
      {/* Resources */}
      { resources.sort((a, b) => a.title.localeCompare(b.title)).map((resource) => {
        const label = resource.title;
        return (
          <Option
            className={smoochBotStyles.smoochBotMenuResource}
            id={`resource_${resource.dbid}`}
            key={resource.uuid}
            label={label}
          />
        );
      })}
    </ul>
  );
};

SmoochBotSidebar.defaultProps = {
  resources: [],
};

SmoochBotSidebar.propTypes = {
  currentOption: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  userRole: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SmoochBotSidebar;
