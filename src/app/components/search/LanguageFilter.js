/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormControl from '@material-ui/core/FormControl';
import InputBase from '@material-ui/core/InputBase';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import MultiSelectFilter from './MultiSelectFilter';
import { languageLabel } from '../../LanguageRegistry';
import LanguageIcon from '../../icons/language.svg';
import RemoveableWrapper from './RemoveableWrapper';
import { FlexRow } from '../../styles/js/shared';

const StyledInputBaseDropdown = withStyles(theme => ({
  root: {
    backgroundColor: 'var(--grayDisabledBackground)',
    padding: `0 ${theme.spacing(0.5)}px`,
    height: theme.spacing(4.5),
    fontSize: 14,
    borderRadius: '4px',
    '& .MuiSelect-icon': {
      color: 'var(--otherWhite)',
    },
  },
  input: {
    backgroundColor: 'var(--brandMain)',
    color: 'var(--otherWhite)',
    paddingLeft: theme.spacing(1),
    '&:focus': {
      backgroundColor: 'var(--brandMain)',
      borderRadius: 4,
    },
    padding: '4px 0 4px',
  },
}))(InputBase);

const Styles = {
  selectFormControl: {
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    padding: '0 4px 0 0',
  },
  wrapper: {
    backgroundColor: 'var(--grayDisabledBackground)',
    borderRadius: '4px',
  },
};

const LanguageFilter = ({
  classes,
  hide,
  value,
  optionsToHide,
  onChange,
  onRemove,
  teamSlug,
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

  const label = {
    language: <FormattedMessage id="search.mediaLanguage" description="Label for media language filter" defaultMessage="Media language" />,
    report_language: <FormattedMessage id="search.reportLanguage" description="Label for report language filter" defaultMessage="Report language" />,
    request_language: <FormattedMessage id="search.requestLanguage" description="Label for conversation Language filter" defaultMessage="Conversation language" />,
  };

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
            <div className={classes.wrapper}>
              <FlexRow>
                <FormControl variant="outlined" className={classes.selectFormControl}>
                  <FormLabel>{/* styling -- the <label> tag changes the height */}</FormLabel>
                  <Select
                    onChange={handleChangeType}
                    value={getValueType()}
                    input={
                      <StyledInputBaseDropdown
                        startAdornment={
                          <RemoveableWrapper icon={<LanguageIcon />} onRemove={onRemove} />
                        }
                      />
                    }
                  >
                    { ['language', 'report_language', 'request_language'].filter(option => !optionsToHide.includes(option)).map(option => (
                      <MenuItem value={option}>{ label[option] }</MenuItem>
                    ))}
                  </Select>
                  <FormattedMessage id="languageFilter.is" defaultMessage="is" description="This connects two selection fields and will read like 'Media language' is 'English'" />
                  <MultiSelectFilter
                    selected={userLanguages}
                    options={languages}
                    onChange={(newValue) => { handleChangeLanguage(newValue); }}
                  />
                </FormControl>
              </FlexRow>
            </div>
          );
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return <CircularProgress size={36} />;
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
  classes: PropTypes.object.isRequired,
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
};

export default withStyles(Styles)(LanguageFilter);
