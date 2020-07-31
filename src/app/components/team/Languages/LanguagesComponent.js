import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';

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
import { ContentColumn } from '../../../styles/js/shared';

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
}));

const LanguagesComponent = ({ team }) => {
  const classes = useToolbarStyles();
  const language = team.get_language || 'en';

  let languages = safelyParseJSON(team.get_languages) || [];
  languages = [language, ...languages.filter(l => l !== language)];

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
                <IconButton color="primary" onClick={handleHelp}>
                  <HelpIcon />
                </IconButton>
              </Box>
              <AddLanguageAction team={team} />
            </Toolbar>
            <p>
              <FormattedMessage
                id="languagesComponent.blurb"
                defaultMessage="Add new languages to your workspace in order to create reports, tipline bots and statuses in multiple languages when communicating with users."
              />
            </p>
            <List>
              {languages.map(l => (
                <LanguageListItem
                  code={l}
                  key={l}
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

export default createFragmentContainer(LanguagesComponent, graphql`
  fragment LanguagesComponent_team on Team {
    id
    get_language
    get_languages
    ...LanguageListItem_team
    ...AddLanguageAction_team
  }
`);
