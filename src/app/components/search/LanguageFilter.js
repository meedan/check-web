import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Select from '../cds/inputs/Select';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import MediasLoading from '../media/MediasLoading';
import MultiSelectFilter from './MultiSelectFilter';
import { languageLabel } from '../../LanguageRegistry';
import LanguageIcon from '../../icons/language.svg';
import RemoveableWrapper from './RemoveableWrapper';
import styles from './search.module.css';

const messages = defineMessages({
  language: {
    id: 'search.mediaLanguage',
    description: 'Label for media language filter',
    defaultMessage: 'Media language',
  },
  report_language: {
    id: 'search.reportLanguage',
    description: 'Label for report language filter',
    defaultMessage: 'Report language',
  },
  request_language: {
    id: 'search.requestLanguage',
    description: 'Label for conversation Language filter',
    defaultMessage: 'Conversation language',
  },
});

const LanguageFilter = ({
  hide,
  value,
  optionsToHide,
  onChange,
  onRemove,
  teamSlug,
  intl,
}) => {
  const getValueType = () => {
    if (value && value.language) return 'language';
    if (value && value.report_language) return 'report_language';
    if (value && value.request_language) return 'request_language';
    return 'language';
  };
  const defaultLanguages = value && value[getValueType()] ? value[getValueType()] : [];
  const [userLanguages, setUserLanguages] = React.useState(defaultLanguages);
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));

  const handleChangeType = (e) => {
    onChange({ [e.target.value]: userLanguages });
  };

  const handleChangeLanguage = (languageValues) => {
    setUserLanguages(languageValues);
    onChange({ [getValueType()]: languageValues });
  };

  if (hide) {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query LanguageFilterQuery($teamSlug: String!, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            get_languages
          }
        }
      `}
      variables={{
        teamSlug,
        random,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const languages = props.team.get_languages ? JSON.parse(props.team.get_languages).map(code => ({ value: code, label: languageLabel(code) })) : [];
          return (
            <div className={styles['filter-wrapper']}>
              <div className={styles['filter-multidate-wrapper']}>
                <RemoveableWrapper icon={<LanguageIcon />} onRemove={onRemove} />
                <Select
                  className={styles['filter-select']}
                  onChange={handleChangeType}
                  value={getValueType()}
                >
                  { ['language', 'report_language', 'request_language'].filter(option => !optionsToHide.includes(option)).map(option => (
                    <option value={option}>{ intl.formatMessage(messages[option]) }</option>
                  ))}
                </Select>
                <ButtonMain
                  disabled
                  theme="text"
                  size="small"
                  variant="text"
                  customStyle={{ color: 'var(--textPrimary' }}
                  label={<FormattedMessage id="languageFilter.is" defaultMessage="is" description="This connects two selection fields and will read like 'Media language' is 'English'" />}
                />
                <MultiSelectFilter
                  selected={userLanguages}
                  options={languages}
                  onChange={(newValue) => { handleChangeLanguage(newValue); }}
                />
              </div>
            </div>
          );
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return <MediasLoading theme="grey" variant="icon" size="icon" />;
      }}
    />
  );
};

LanguageFilter.defaultProps = {
  hide: false,
  value: null,
  optionsToHide: [],
};

LanguageFilter.propTypes = {
  hide: PropTypes.bool,
  optionsToHide: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.oneOfType([
    PropTypes.shape({
      language: PropTypes.arrayOf(PropTypes.string),
    }),
    PropTypes.shape({
      report_language: PropTypes.arrayOf(PropTypes.string),
    }),
    PropTypes.shape({
      request_language: PropTypes.arrayOf(PropTypes.string),
    }),
  ]),
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(LanguageFilter);
