import React from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Slider from '@material-ui/core/Slider';
import TextField from '../cds/inputs/TextField';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import LibraryAddCheckIcon from '../../icons/library_add_check.svg';
import styles from './BotPreview.module.css';
import settingsStyles from '../team/Settings.module.css';

const valueLabelComponet = (props) => {
  const { children, open, value } = props;

  return (
    <Tooltip arrow open={open} placement="top" title={value}>
      {children}
    </Tooltip>
  );
};

const messages = defineMessages({
  lenientMessage: {
    id: 'matchingSettings.lowRange',
    defaultMessage: 'Lenient',
    description: 'Label for low end of similarity threshold',
  },
  strictMessage: {
    id: 'matchingSettings.highRange',
    defaultMessage: 'Strict',
    description: 'Label for the high end of the similarity threshold',
  },
});

const MatchingSettings = ({
  intl,
  isAdmin,
  maxWordsMatching,
  onChangeMaxWordsMatching,
  onChangeSimilarityThresholdMatching,
  similarityThresholdMatching,
}) => {
  const marks = [
    {
      value: '0.75',
      label: intl.formatMessage(messages.lenientMessage),
    },
    {
      value: '0.80',
      label: '',
    },
    {
      value: '0.85',
      label: '',
    },
    {
      value: '0.90',
      label: intl.formatMessage(messages.strictMessage),
    },
  ];

  return (
    <div className={styles['settings-card']}>
      <div className={styles['settings-card-header']}>
        <LibraryAddCheckIcon />
        <span>Matching</span>
      </div>
      <div className={settingsStyles['setting-content-container']}>
        <TextField
          defaultValue={maxWordsMatching}
          disabled={!isAdmin}
          helpContent={
            <FormattedMessage
              defaultMessage="Maximum number of words to perform a keyword search instead of a similarity search."
              description="Message for additional context for the use of the maximum word value"
              id="matchingSettings.maxWordsHelpMessage"
            />
          }
          label={
            <FormattedMessage
              defaultMessage="Maximum words"
              description="Label for maximum matching words input"
              id="matchingSettings.maxWordsLabel"
            />
          }
          required
          onChange={e => onChangeMaxWordsMatching(parseInt(e.target.value, 10))}
        />
      </div>
      <div className={settingsStyles['setting-content-container']}>
        <div className={styles['settings-slider-help-text']}>
          <FormattedMessage
            defaultMessage="Search Threshold"
            description="Label for the search threshold slider"
            id="matchingSettings.similarityThresholdLabel"
          />
        </div>
        <div className={styles['settings-slider-wrapper']}>
          <Slider
            ValueLabelComponent={valueLabelComponet}
            defaultValue={Number(similarityThresholdMatching)}
            disabled={!isAdmin}
            marks={marks}
            max={0.9}
            min={0.75}
            step={null}
            track={false}
            valueLabelDisplay="auto"
            valueLabelFormat={x => (<FormattedMessage
              defaultMessage="Search Threshold: {val}"
              description="Label for value on slider."
              id="matchingSettings.similarityThresholdValueLabel"
              values={{ val: x }}
            />)}
            onChange={(e, val) => onChangeSimilarityThresholdMatching(val.toString())}
          />
        </div>
        <div className={styles['settings-slider-help-text']}>
          <FormattedMessage
            defaultMessage="When searching for articles to return based on a user message, how strict should the bot be when comparing text."
            description="Additional context for the use of the value for the search threshold slider"
            id="matchingSettings.similarityThresholdHelpMessage"
          />
        </div>
      </div>
    </div>
  );
};

export default injectIntl(MatchingSettings);
