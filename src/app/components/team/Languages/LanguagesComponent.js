import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import HelpIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import AddLanguageAction from './AddLanguageAction';
import LanguageListItem from './LanguageListItem';
import { safelyParseJSON } from '../../../helpers';
import { checkBlue, ContentColumn } from '../../../styles/js/shared';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    flex: '1 1 100%',
    alignSelf: 'center',
  },
  button: {
    whiteSpace: 'nowrap',
  },
  helpIcon: {
    color: checkBlue,
  },
}));

const LanguagesComponent = ({ team }) => {
  const language = team.get_language;
  const languages = safelyParseJSON(team.get_languages) || [];
  const classes = useToolbarStyles();

  const handleHelp = () => {
    window.open('https://help.checkmedia.org/en/articles/4285291-content-language');
  };

  return (
    <React.Fragment>
      <ContentColumn large>
        <Card>
          <CardContent>
            <Toolbar className={classes.root}>
              <Box display="flex" justifyContent="center">
                <Typography className={classes.title} color="inherit" variant="h6" component="div">
                  <FormattedMessage
                    id="languagesComponent.title"
                    defaultMessage="Content languages"
                  />
                </Typography>
                <IconButton onClick={handleHelp}>
                  <HelpIcon className={classes.helpIcon} />
                </IconButton>
              </Box>
              <AddLanguageAction languages={languages} team={team} />
            </Toolbar>
            <List>
              {languages.map(l => (
                <LanguageListItem
                  code={l}
                  key={l}
                  languages={languages}
                  isDefault={l === language}
                  team={team}
                />
              ))}
            </List>
          </CardContent>
        </Card>
      </ContentColumn>
    </React.Fragment>
  );
};

LanguagesComponent.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    get_language: PropTypes.string.isRequired,
    get_languages: PropTypes.string.isRequired,
  }).isRequired,
};

export default LanguagesComponent;
