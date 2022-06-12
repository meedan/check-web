import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SettingsHeader from '../SettingsHeader';
import LanguageSwitcher from '../../LanguageSwitcher';
import { ContentColumn } from '../../../styles/js/shared';

const useStyles = makeStyles({
  container: {
    maxHeight: 720,
  },
});

const TeamDataComponent = ({
  data,
  defaultLanguage,
  languages,
}) => {
  const classes = useStyles();
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);

  const headers = data ? Object.keys(data[0]).filter(header => !['ID', 'Org', 'Language', 'Platform'].includes(header)) : null;

  const platforms = [];
  if (data) {
    data.forEach((row) => {
      if (platforms.indexOf(row.Platform) === -1) {
        platforms.push(row.Platform);
      }
    });
  }
  const [currentPlatform, setCurrentPlatform] = React.useState(platforms[0]);

  return (
    <Box display="flex" justifyContent="left" className="team-report-component">
      <LanguageSwitcher
        orientation="vertical"
        primaryLanguage={defaultLanguage}
        currentLanguage={currentLanguage}
        languages={JSON.parse(languages)}
        onChange={setCurrentLanguage}
      />
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="teamDataComponent.title"
              defaultMessage="Tipline engagement data"
              description="Header for the stored data page of the current team"
            />
          }
          extra={
            <FormControl variant="outlined">
              <Select value={currentPlatform} onChange={(e) => { setCurrentPlatform(e.target.value); }}>
                {platforms.map(platform => (
                  <MenuItem value={platform} key={platform}>{platform}</MenuItem>
                ))}
              </Select>
            </FormControl>
          }
          helpUrl="https://help.checkmedia.org/en/articles/4511362"
        />
        <Card>
          <CardContent>
            { data ?
              <TableContainer className={classes.container}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {headers.map(header => <TableCell key={header}>{header}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row) => {
                      if (row.Language === currentLanguage && row.Platform === currentPlatform) {
                        return (
                          <TableRow>
                            {headers.map(header => <TableCell key={`${row.ID}-${header}`}>{row[header]}</TableCell>)}
                          </TableRow>
                        );
                      }
                      return null;
                    })}
                  </TableBody>
                </Table>
              </TableContainer> :
              <React.Fragment>
                <Typography variant="body1" component="p" paragraph>
                  <FormattedMessage
                    id="teamDataComponent.set1"
                    defaultMessage="Fill {thisShortForm} to request access to your data report."
                    values={{
                      thisShortForm: (
                        <a href="https://airtable.com/shrWpaztZ2SzD5TrA" target="_blank" rel="noopener noreferrer">
                          <FormattedMessage id="teamDataComponent.formLinkText" defaultMessage="this short form" />
                        </a>
                      ),
                    }}
                  />
                </Typography>
                <Typography variant="body1" component="p" paragraph>
                  <FormattedMessage id="teamDataComponent.set2" defaultMessage="Your data report will be enabled within one business day." />
                </Typography>
              </React.Fragment> }
          </CardContent>
        </Card>
      </ContentColumn>
    </Box>
  );
};

TeamDataComponent.defaultProps = {
  data: null,
  defaultLanguage: null,
  languages: [],
};

TeamDataComponent.propTypes = {
  data: PropTypes.object, // or null
  defaultLanguage: PropTypes.string, // or null
  languages: PropTypes.arrayOf(PropTypes.string), // or null
};

export default TeamDataComponent;
