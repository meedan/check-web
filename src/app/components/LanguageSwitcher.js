import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Box from '@material-ui/core/Box';
import { compareLanguages, languageLabel } from '../LanguageRegistry';

const LanguageSwitcher = (props) => {
  const { primaryLanguage, currentLanguage } = props;
  const languages = props.languages.sort((a, b) => compareLanguages(primaryLanguage, a, b));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleChange = (event, newValue) => {
    props.onChange(newValue);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSetDefault = () => {
    props.onSetDefault(currentLanguage);
    setAnchorEl(null);
  };

  return (
    <Tabs
      value={currentLanguage}
      onChange={handleChange}
      scrollButtons="auto"
      variant="scrollable"
    >
      { languages.map((languageCode) => {
        const label = languageLabel(languageCode);
        return (
          <Tab
            label={
              <Box display="flex" alignItems="center">
                <div>
                  { languageCode === primaryLanguage ?
                    <FormattedMessage
                      id="languageSwitcher.primaryLanguage"
                      defaultMessage="{language} (default)"
                      values={{
                        language: label,
                      }}
                    /> : label }
                </div>
                { props.onSetDefault && languageCode !== primaryLanguage ?
                  <div>
                    <IconButton onClick={handleClick}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      keepMounted
                      open={open}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={handleSetDefault}>
                        <FormattedMessage
                          id="languageSwitcher.makeDefault"
                          defaultMessage="Set as default language for this item"
                        />
                      </MenuItem>
                    </Menu>
                  </div> : null }
              </Box>
            }
            value={languageCode}
            key={languageCode}
          />
        );
      })}
    </Tabs>
  );
};

LanguageSwitcher.defaultProps = {
  onSetDefault: null,
};

LanguageSwitcher.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  primaryLanguage: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onSetDefault: PropTypes.func,
};

export default LanguageSwitcher;
