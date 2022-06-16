/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import GetAppIcon from '@material-ui/icons/GetApp';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import HelpIcon from '@material-ui/icons/HelpOutline';
import SettingsHeader from '../SettingsHeader';
import LanguageSwitcher from '../../LanguageSwitcher';
import { ContentColumn } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  container: {
    maxHeight: 720,
  },
  dropDowns: {
    gap: `${theme.spacing(2)}px`,
  },
  tableCell: {
    whiteSpace: 'nowrap',
  },
  helpIcon: {
    marginLeft: theme.spacing(1),
    color: '#656565',
    cursor: 'help',
  },
}));

const messagesDescription = 'Explanation on table header, when hovering the "help" icon, on data settings page';
const messages = defineMessages({
  month: {
    id: 'teamDataComponent.month',
    defaultMessage: 'Month related to this data',
    description: messagesDescription,
  },
  conversations: {
    id: 'teamDataComponent.conversations',
    defaultMessage: 'Number of users sessions with the tipline bot.',
    description: messagesDescription,
  },
  averageMessagesPerDay: {
    id: 'teamDataComponent.averageMessagesPerDay',
    defaultMessage: 'Average number of messages sent by tipline users per day.',
    description: messagesDescription,
  },
  uniqueUsers: {
    id: 'teamDataComponent.uniqueUsers',
    defaultMessage: 'Number of distinct users who interacted with the tipline bot.',
    description: messagesDescription,
  },
  returningUsers: {
    id: 'teamDataComponent.returningUsers',
    defaultMessage: 'Number of users who had at least one session in the current month, and at least one session in the last previous 2 months.',
    description: messagesDescription,
  },
  validNewQueries: {
    id: 'teamDataComponent.validNewQueries',
    defaultMessage: 'Number of user submissions that are not in the trash.',
    description: messagesDescription,
  },
  publishedNativeReports: {
    id: 'teamDataComponent.publishedNativeReports',
    defaultMessage: 'Number of reports created and published from inside Check.',
    description: messagesDescription,
  },
  publishedImportedReports: {
    id: 'teamDataComponent.publishedImportedReports',
    defaultMessage: 'Number of published reports imported from external web sites.',
    description: messagesDescription,
  },
  queriesAnsweredWithReport: {
    id: 'teamDataComponent.queriesAnsweredWithReport',
    defaultMessage: 'Number of queries answered with a report.',
    description: messagesDescription,
  },
  reportsSent: {
    id: 'teamDataComponent.reportsSent',
    defaultMessage: 'Number of reports received by users.',
    description: messagesDescription,
  },
  uniqueUsersWhoReceivedReport: {
    id: 'teamDataComponent.uniqueUsersWhoReceivedReport',
    defaultMessage: 'Number of distinct users who received a report.',
    description: messagesDescription,
  },
  responseTime: {
    id: 'teamDataComponent.responseTime',
    defaultMessage: 'Average time between users submitting a query and receiving a report.',
    description: messagesDescription,
  },
  uniqueNewslettersSent: {
    id: 'teamDataComponent.uniqueNewslettersSent',
    defaultMessage: 'Number of newsletters sent.',
    description: messagesDescription,
  },
  newNewsletterSubscriptions: {
    id: 'teamDataComponent.newNewsletterSubscriptions',
    defaultMessage: 'Number of new newsletter subscriptions.',
    description: messagesDescription,
  },
  newsletterCancellations: {
    id: 'teamDataComponent.newsletterCancellations',
    defaultMessage: 'Number of newsletter cancellations.',
    description: messagesDescription,
  },
  currentSubscribers: {
    id: 'teamDataComponent.currentSubscribers',
    defaultMessage: 'Current number of newsletter subscriptions.',
    description: messagesDescription,
  },
});

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function formatValue(header, value) {
  let formattedValue = value;
  if (header === 'Month') {
    formattedValue = value.replace(/^[0-9]+\. /, '');
  }
  return formattedValue;
}

const TeamDataComponent = ({
  intl,
  data,
  defaultLanguage,
  languages,
}) => {
  const classes = useStyles();
  const defaultOrder = 'Month';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState(defaultOrder);

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

  const helpMessages = {
    Month: intl.formatMessage(messages.month),
    Conversations: intl.formatMessage(messages.conversations),
    'Average messages per day': intl.formatMessage(messages.averageMessagesPerDay),
    'Unique users': intl.formatMessage(messages.uniqueUsers),
    'Returning users': intl.formatMessage(messages.returningUsers),
    'Valid new queries': intl.formatMessage(messages.validNewQueries),
    'Published native reports': intl.formatMessage(messages.publishedNativeReports),
    'Published imported reports': intl.formatMessage(messages.publishedImportedReports),
    'Queries answered with a report': intl.formatMessage(messages.queriesAnsweredWithReport),
    'Reports sent to users': intl.formatMessage(messages.reportsSent),
    'Unique users who received a report': intl.formatMessage(messages.uniqueUsersWhoReceivedReport),
    'Average (median) response time': intl.formatMessage(messages.responseTime),
    'Unique newsletters sent': intl.formatMessage(messages.uniqueNewslettersSent),
    'New newsletter subscriptions': intl.formatMessage(messages.newNewsletterSubscriptions),
    'Newsletter cancellations': intl.formatMessage(messages.newsletterCancellations),
    'Current subscribers': intl.formatMessage(messages.currentSubscribers),
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = property => (event) => {
    handleRequestSort(event, property);
  };

  let rows = [];
  if (data) {
    rows = stableSort(data.filter(row => row.Language === currentLanguage && row.Platform === currentPlatform), getComparator(order, orderBy));
  }

  const handleDownload = () => {
    const csv = [headers.join(',')];

    rows.forEach((row) => {
      const csvRow = [];
      headers.forEach((header) => {
        csvRow.push(formatValue(header, row[header]));
      });
      csv.push(csvRow.join(','));
    });

    // Create a blob
    const blob = new Blob([csv.join('\r\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a link to download it
    const pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', 'data-report.csv');
    pom.click();
  };

  return (
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
          <Box display="flex" className={classes.dropDowns}>
            <FormControl variant="outlined">
              { platforms.length > 1 ?
                <Select value={currentPlatform} onChange={(e) => { setCurrentPlatform(e.target.value); }} margin="dense">
                  {platforms.map(platform => (
                    <MenuItem value={platform} key={platform}>{platform}</MenuItem>
                  ))}
                </Select> : null }
            </FormControl>
            { JSON.parse(languages).length > 1 ?
              <LanguageSwitcher
                component="dropdown"
                currentLanguage={currentLanguage}
                languages={JSON.parse(languages)}
                onChange={setCurrentLanguage}
              /> : null }
          </Box>
        }
        actionButton={
          <Button variant="contained" color="primary" startIcon={<GetAppIcon />} onClick={handleDownload}>
            <FormattedMessage
              id="teamDataComponent.download"
              defaultMessage="Download CSV"
              description="Label for action button displayed on workspace data report page."
            />
          </Button>
        }
        helpUrl="https://help.checkmedia.org/en/articles/4511362"
      />
      <Card>
        <CardContent>
          { data ?
            <TableContainer className={[classes.container, 'team-data-component__with-data'].join(' ')}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {headers.map(header => (
                      <TableCell key={header} className={classes.tableCell} sortDirection={orderBy === header ? order : false}>
                        <TableSortLabel active={orderBy === header} direction={orderBy === header ? order : 'asc'} onClick={createSortHandler(header)}>
                          <Box display="flex" alignItems="center">
                            {header}
                            {' '}
                            <Tooltip key={header} title={helpMessages[header] || header}>
                              <HelpIcon fontSize="small" className={classes.helpIcon} />
                            </Tooltip>
                          </Box>
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.ID}>
                      {headers.map(header => (<TableCell key={`${row.ID}-${header}`} className={classes.tableCell}>{formatValue(header, row[header])}</TableCell>))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> :
            <Box className="team-data-component__no-data">
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
            </Box> }
        </CardContent>
      </Card>
    </ContentColumn>
  );
};

TeamDataComponent.defaultProps = {
  data: null,
  defaultLanguage: null,
  languages: '[]',
};

TeamDataComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object), // or null
  defaultLanguage: PropTypes.string, // or null
  languages: PropTypes.string, // JSON-encoded array of languages, or null
  intl: intlShape.isRequired,
};

export default injectIntl(TeamDataComponent);
