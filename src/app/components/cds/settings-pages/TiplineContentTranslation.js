import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import TextArea from '../inputs/TextArea';
import Tooltip from '../alerts-and-prompts/Tooltip';
import ChevronUpIcon from '../../../icons/chevron_up.svg';
import ChevronRightIcon from '../../../icons/chevron_right.svg';
import DoneIcon from '../../../icons/done.svg';
import HelpIcon from '../../../icons/help.svg';
import styles from '../../team/Settings.module.css';

const messages = defineMessages({
  expandCollapse: {
    id: 'smoochBotContentAndTranslation.expandCollapse',
    defaultMessage: 'Expand/Collapase content details',
    description: 'Tooltip for the button to show or hide a content details in the list',
  },
  customized: {
    id: 'smoochBotContentAndTranslation.customized',
    defaultMessage: 'Customized',
    description: 'Label to indicate that a bot response has been customized and is different than the default message',
  },
  textFieldTitle: {
    id: 'smoochBotContentAndTranslation.textFieldTitle',
    defaultMessage: 'Custom text',
    description: 'Title for the textfield where users can enter custom text for a bot response',
  },
  defaultText: {
    id: 'smoochBotContentAndTranslation.defaultTextTitle',
    defaultMessage: 'Default text',
    description: 'Title for the area to show users what the default text value is for this bot response',
  },
  placeholder: {
    id: 'smoochBotContentAndTranslation.placeholder',
    defaultMessage: 'Type custom content or translation here.',
    description: 'Placeholder used in all fields under tipline content and translation settings.',
  },
});

const TiplineContentTranslation = ({
  intl,
  identifier,
  title,
  description,
  defaultValue,
  onUpdate,
  value,
  error,
  extra,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={cx(styles['content-translation-wrapper'], expanded ? styles['content-translation-wrapper-expanded'] : styles['content-translation-wrapper-collapsed'])}>
      <div className={styles['setting-content-container-title']}>
        <Tooltip
          arrow
          title={intl.formatMessage(messages.expandCollapse)}
        >
          <span className={styles['setting-content-container-title-expand']}>
            <ButtonMain
              variant="contained"
              size="small"
              theme="lightText"
              onClick={() => { setExpanded(!expanded); }}
              iconCenter={expanded ? <ChevronUpIcon /> : <ChevronRightIcon />}
            />
          </span>
        </Tooltip>
        {title}
        { !value &&
          <div>
            <DoneIcon />
            {intl.formatMessage(messages.customized)}
          </div>
        }
        <div className={styles['setting-content-container-actions']}>
          <Tooltip
            arrow
            title={description}
          >
            <span>
              <ButtonMain
                disabled
                buttonProps={{
                  type: null,
                }}
                variant="contained"
                size="small"
                theme="text"
                iconCenter={<HelpIcon />}
              />
            </span>
          </Tooltip>
        </div>
      </div>
      <div className={styles['content-translation-details']}>
        { !value &&
          <div>
            <label>{intl.formatMessage(messages.defaultText)}</label>
            {defaultValue}
          </div>
        }
        <TextArea
          key={identifier}
          label={intl.formatMessage(messages.textFieldTitle)}
          placeholder={intl.formatMessage(messages.placeholder)}
          rowsMax={Infinity}
          rows={1}
          defaultValue={value}
          onBlur={(e) => { onUpdate(e.target.value); }}
          error={Boolean(error)}
          helpContent={error}
        />
        {extra}
      </div>
    </div>
  );
};

TiplineContentTranslation.defaultProps = {
  value: null, // Custom value
  error: null,
  extra: null,
};

TiplineContentTranslation.propTypes = {
  intl: intlShape.isRequired,
  identifier: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  defaultValue: PropTypes.node.isRequired,
  onUpdate: PropTypes.func.isRequired,
  value: PropTypes.string,
  error: PropTypes.node,
  extra: PropTypes.node,
};

export default injectIntl(TiplineContentTranslation);
