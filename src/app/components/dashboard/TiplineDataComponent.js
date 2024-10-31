import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import cx from 'classnames/bind';
import BlankState from '../layout/BlankState';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import HelpIcon from '../../icons/help.svg';
import IosShareIcon from '../../icons/ios_share.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import LanguagePickerSelect from '../cds/inputs/LanguagePickerSelect';
import Select from '../cds/inputs/Select';
import styles from './Dashboard.module.css';

const messagesDescription = 'Explanation on table header, when hovering the "help" icon, on data settings page';
const messages = defineMessages({
  allData: {
    id: 'teamDataComponent.allDataTitle',
    defaultMessage: 'All Data:',
    description: 'Header for the stored data page of the current team',
  },
  uniqueUsers: {
    id: 'teamDataComponent.uniqueUsers',
    defaultMessage: 'Unique users who interacted with the bot.',
    description: messagesDescription,
  },
  returningUsers: {
    id: 'teamDataComponent.returningUsers',
    defaultMessage: 'Unique users who had at least one session in the current month, and at least one session in the last previous two months.',
    description: messagesDescription,
  },
  publishedReports: {
    id: 'teamDataComponent.publishedReports',
    defaultMessage: 'Published reports created in Check or imported into Check (for all platforms).',
    description: messagesDescription,
  },
  reportsSent: {
    id: 'teamDataComponent.reportsSent',
    defaultMessage: 'Reports sent in response to requests. For example, if two users requested the same claim and received the same report, it counts as two.',
    description: messagesDescription,
  },
  uniqueUsersWhoReceivedReport: {
    id: 'teamDataComponent.uniqueUsersWhoReceivedReport',
    defaultMessage: 'Unique users who received a report. For example, if one user received three reports, it counts as one.',
    description: messagesDescription,
  },
  responseTime: {
    id: 'teamDataComponent.responseTime',
    defaultMessage: 'Average time between a user request and a report sent.',
    description: messagesDescription,
  },
  uniqueNewslettersSent: {
    id: 'teamDataComponent.uniqueNewslettersSent',
    defaultMessage: 'Unique newsletters sent, for all platforms.',
    description: messagesDescription,
  },
  newsletterSubscriptions: {
    id: 'teamDataComponent.newsletterSubscriptions',
    defaultMessage: 'Increase in newsletter subscriptions month on month.',
    description: messagesDescription,
  },
  newsletterCancellations: {
    id: 'teamDataComponent.newsletterCancellations',
    defaultMessage: 'Newsletter cancellations.',
    description: messagesDescription,
  },
  currentSubscribers: {
    id: 'teamDataComponent.currentSubscribers',
    defaultMessage: 'Current number of newsletter subscriptions.',
    description: messagesDescription,
  },
  newslettersDelivered: {
    id: 'teamDataComponent.newslettersDelivered',
    defaultMessage: 'The total number of newsletters successfully delivered to subscribers, within 24 hours of being sent as well as accounting for user errors.',
    description: messagesDescription,
  },
  whatsappConversations: {
    id: 'teamDataComponent.whatsappConversations',
    defaultMessage: 'Conversations are 24-hour message threads between you and your users. They are opened when messages sent by Check to users are delivered.',
    description: messagesDescription,
  },
  whatsappConversationsUser: {
    id: 'teamDataComponent.whatsappConversationsUser',
    defaultMessage: 'Conversations are 24-hour message threads between you and your users. Service conversations are initiated when no conversation exists between you and a user and a user messages you, triggering a message from the bot. If a user is blocked, no user conversation is created.',
    description: messagesDescription,
  },
  whatsappConversationsBusiness: {
    id: 'teamDataComponent.whatsappConversationsBusiness',
    defaultMessage: 'Conversations are 24-hour message threads between you and your users. Business conversations are initiated when no open conversation exists between you and a user, and a message you send is received by that user.',
    description: messagesDescription,
  },
  positiveSearches: {
    id: 'teamDataComponent.positiveSearches',
    defaultMessage: 'Number of user searches that returned at least one report.',
    description: messagesDescription,
  },
  negativeSearches: {
    id: 'teamDataComponent.negativeSearches',
    defaultMessage: 'Number of user searches that did not return a report.',
    description: messagesDescription,
  },
  positiveFeedback: {
    id: 'teamDataComponent.positiveFeedback',
    defaultMessage: 'Number of conversations that returned at least one result and the user answered "Yes".',
    description: messagesDescription,
  },
  negativeFeedback: {
    id: 'teamDataComponent.negativeFeedback',
    defaultMessage: 'Number of conversations that returned at least one result and the user answered "No".',
    description: messagesDescription,
  },
  newslettersSent: {
    id: 'teamDataComponent.newslettersSent',
    defaultMessage: 'The total number of newsletters sent to subscribers.',
    description: messagesDescription,
  },
});

function descendingComparator(a, b, orderBy) {
  let value1 = a[orderBy];
  let value2 = b[orderBy];
  // Special case for months
  if (orderBy === 'Month') {
    const convertMonthToNumber = value => (parseInt(value.replace(/^([0-9]+)\..*/, '$1'), 10));
    value1 = convertMonthToNumber(a[orderBy]);
    value2 = convertMonthToNumber(b[orderBy]);
  }
  if (value2 < value1) {
    return -1;
  }
  if (value2 > value1) {
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

const TiplineDataComponent = ({
  data,
  defaultLanguage,
  intl,
  slug,
}) => {
  const defaultOrder = 'Month';
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState(defaultOrder);

  const headers = data ? Object.keys(data[0]).filter(header => !['ID', 'Org', 'Language', 'Platform'].includes(header)) : [];

  const languages = [];
  const platforms = [];

  if (data) {
    data.forEach((row) => {
      if (platforms.indexOf(row.Platform) === -1) {
        platforms.push(row.Platform);
      }
      if (languages.indexOf(row.Language) === -1) {
        languages.push(row.Language);
      }
    });
  }
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage || languages[0]);
  const [currentPlatform, setCurrentPlatform] = React.useState(platforms[0]);

  const helpMessages = {
    'WhatsApp conversations': intl.formatMessage(messages.whatsappConversations),
    'Business Conversations': intl.formatMessage(messages.whatsappConversationsBusiness),
    'Service Conversations': intl.formatMessage(messages.whatsappConversationsUser),
    'Unique users': intl.formatMessage(messages.uniqueUsers),
    'Returning users': intl.formatMessage(messages.returningUsers),
    'Published reports': intl.formatMessage(messages.publishedReports),
    'Reports sent to users': intl.formatMessage(messages.reportsSent),
    'Unique users who received a report': intl.formatMessage(messages.uniqueUsersWhoReceivedReport),
    'Average (median) response time': intl.formatMessage(messages.responseTime),
    'Unique newsletters sent': intl.formatMessage(messages.uniqueNewslettersSent),
    'Newsletter subscriptions': intl.formatMessage(messages.newsletterSubscriptions),
    'Newsletter cancellations': intl.formatMessage(messages.newsletterCancellations),
    'Current subscribers': intl.formatMessage(messages.currentSubscribers),
    'Total newsletters delivered': intl.formatMessage(messages.newslettersDelivered),
    'Positive searches': intl.formatMessage(messages.positiveSearches),
    'Negative searches': intl.formatMessage(messages.negativeSearches),
    'Positive feedback': intl.formatMessage(messages.positiveFeedback),
    'Negative feedback': intl.formatMessage(messages.negativeFeedback),
    'Total newsletters sent': intl.formatMessage(messages.newslettersSent),
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
    pom.setAttribute('download', `data-report-${slug}-${currentPlatform.toLowerCase()}-${currentLanguage}-${new Date().toISOString().split('T')[0]}.csv`);
    pom.click();
  };

  const dates = [];
  rows.forEach((row) => {
    dates.push(formatValue('Month', row.Month));
  });
  // const dates = ['Sep 2024', 'Jan 2023', 'Dec 2023', 'Feb 2024'];
  const parseMonthYear = (value) => {
    const [month, year] = value.split(' ');
    const monthIndex = new Date(`${month} 1`).getMonth();
    return new Date(year, monthIndex);
  };
  dates.sort((a, b) => parseMonthYear(a) - parseMonthYear(b));

  const [firstValue, ...rest] = dates;
  const lastValue = rest?.length > 0 ? rest[rest.length - 1] : firstValue;

  return (
    <div className={styles['dashboard-data-table']}>
      <div className={styles['dashboard-data-table-header']}>
        <div className={styles['dashboard-data-table-header-title']}>
          <h5>
            {intl.formatMessage(messages.allData)}
          </h5>
          { (platforms.length > 1 || languages.length > 1) &&
            <>
              { platforms.length > 1 ?
                <Select
                  value={currentPlatform}
                  onChange={(e) => { setCurrentPlatform(e.target.value); }}
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </Select> : null }
              { languages.length > 1 ?
                <LanguagePickerSelect
                  languages={languages}
                  selectedLanguage={currentLanguage}
                  onSubmit={newValue => setCurrentLanguage(newValue.languageCode)}
                /> : null
              }
            </>
          }
        </div>
        <div className={styles['dashboard-data-table-header-actions']}>
          { dates &&
            <h6>
              {firstValue} - {lastValue}
            </h6>
          }
          <ButtonMain
            iconLeft={<IosShareIcon />}
            label={
              <FormattedMessage
                defaultMessage="Export"
                description="Label for action button displayed on workspace data report page."
                id="teamDataComponent.download"
              />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={handleDownload}
          />
        </div>
      </div>
      { data ?
        <TableContainer className={cx('team-data-component__with-data', styles['engagement-data-table-wrapper'])}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {headers.map(header => (
                  <TableCell
                    className={cx(
                      [styles.tableCell],
                      {
                        [styles.stickyTableCell]: header === 'Month',
                      })
                    }
                    key={header}
                    sortDirection={orderBy === header ? order : false}
                  >
                    <TableSortLabel active={orderBy === header} direction={orderBy === header ? order : 'asc'} onClick={createSortHandler(header)}>
                      <span>{header}</span>
                      { helpMessages[header] ?
                        <Tooltip arrow key={header} title={helpMessages[header]}>
                          <span className={styles['table-header-tooltip']}>
                            <HelpIcon />
                          </span>
                        </Tooltip> : null }
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <tbody>
              {rows.map(row => (
                <TableRow key={row.ID}>
                  {headers.map(header => (
                    <TableCell
                      className={cx(
                        [styles.tableCell],
                        {
                          [styles.stickyTableCell]: header === 'Month',
                        })
                      }
                      key={`${row.ID}-${header}`}
                    >
                      {formatValue(header, row[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer> :
        <div className="team-data-component__no-data">
          <BlankState>
            <FormattedMessage
              defaultMessage="No Data Available"
              description="Message when the data table for all data has no contents"
              id="teamDataComponent.noData"
            />
          </BlankState>
        </div>
      }
    </div>
  );
};

TiplineDataComponent.defaultProps = {
  data: null,
  defaultLanguage: null,
};

TiplineDataComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object), // or null
  defaultLanguage: PropTypes.string, // or null
  intl: intlShape.isRequired,
  slug: PropTypes.string.isRequired,
};

export default injectIntl(TiplineDataComponent);
