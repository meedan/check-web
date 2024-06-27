import React from 'react';
import PropTypes from 'prop-types';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { labelsV2 } from './localizables';
import smoochBotStyles from './SmoochBot.module.css';

const SmoochBotSidebar = ({
  userRole,
  currentOption,
  resources,
  onClick,
}) => {
  const handleClick = (option) => {
    onClick(option);
  };

  const Option = ({ id, label }) => {
    if (id === 'smooch_settings' && userRole !== 'admin') {
      return null;
    }

    return (
      <li>
        <ButtonMain
          key={id}
          size="default"
          variant={currentOption === id ? 'contained' : 'text'}
          theme="black"
          onClick={() => { handleClick(id); }}
          label={label}
          className={smoochBotStyles.smoochBotMenuButton}
        />
      </li>
    );
  };

  return (
    <ul className={smoochBotStyles.smoochBotMenu}>
      {/* Menu options */}
      { Object.keys(labelsV2).map((key) => {
        const label = labelsV2[key];
        return <Option key={key} id={key} label={label} />;
      })}
      {/* Resources */}
      { resources.sort((a, b) => a.title.localeCompare(b.title)).map((resource) => {
        const label = resource.title;
        return (
          <Option
            key={resource.uuid}
            id={`resource_${resource.dbid}`}
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
  userRole: PropTypes.string.isRequired,
  currentOption: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  onClick: PropTypes.func.isRequired,
};

export default SmoochBotSidebar;
