import React from 'react';
import { FormattedMessage } from 'react-intl';
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

const marks = [
  {
    value: '0.75',
    label: 'Lenient',
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
    label: 'Strict',
  },
];

const MatchingSettings = ({
  isAdmin,
  maxWordsMatching,
  onChangeMaxWordsMatching,
  onChangeSimilarityTresholdMatching,
  similarityThresholdMatching,
}) => (
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
          defaultMessage="Search Treshold"
          description="Label for the search treshold slider"
          id="matchingSettings.similarityTresholdLabel"
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
          valueLabelDisplay="on"
          valueLabelFormat={x => (<FormattedMessage
            defaultMessage="Search Treshold: {val}"
            description="Label for value on slider."
            id="matchingSettings.similarityTresholdValueLabel"
            values={{ val: x }}
          />)}
          onChange={(e, val) => onChangeSimilarityTresholdMatching(val.toString())}
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

export default MatchingSettings;
