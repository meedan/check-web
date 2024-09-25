import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import Alert from '../../cds/alerts-and-prompts/Alert';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../../cds/inputs/TextArea';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ChevronDownIcon from '../../../icons/chevron_down.svg';
import ChevronRightIcon from '../../../icons/chevron_right.svg';
import DoneIcon from '../../../icons/done.svg';
import HelpIcon from '../../../icons/help.svg';
import styles from '../../team/Settings.module.css';

const messages = defineMessages({
  expandCollapse: {
    id: 'smoochBotContentAndTranslation.expandCollapse',
    defaultMessage: 'Expand/Collapse content details',
    description: 'Tooltip for the button to show or hide a content details in the list',
  },
  customized: {
    id: 'smoochBotContentAndTranslation.customized',
    defaultMessage: 'Customized',
    description: 'Label to indicate that a bot response has been customized and is different than the default message',
  },
  viewDefault: {
    id: 'smoochBotContentAndTranslation.viewDefault',
    defaultMessage: 'Default Bot Response',
    description: 'Label for button to allow users to show or hide the default bot response, when a custom response is currently in use.',
  },
  textFieldTitleCustomized: {
    id: 'smoochBotContentAndTranslation.textFieldTitleCustomized',
    defaultMessage: 'Custom Bot Response',
    description: 'Title for the textfield where users have enter custom text for a bot response',
  },
  textFieldTitleDefault: {
    id: 'smoochBotContentAndTranslation.textFieldTitleDefault',
    defaultMessage: 'Customize Bot Response',
    description: 'Title for the textfield where users can enter custom text for a bot response',
  },
  defaultText: {
    id: 'smoochBotContentAndTranslation.defaultTextTitle',
    defaultMessage: 'Default Bot Response:',
    description: 'Title for the area to show users what the default text value is for this bot response',
  },
  placeholder: {
    id: 'smoochBotContentAndTranslation.placeholder',
    defaultMessage: 'Type custom content or translation here.',
    description: 'Placeholder used in all fields under tipline content and translation settings.',
  },
});

const TiplineContentTranslation = ({
  defaultValue,
  description,
  error,
  extra,
  identifier,
  intl,
  onUpdate,
  title,
  value,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [defaultExpanded, setDefaultExpanded] = React.useState(false);

  return (
    <div className={cx(styles['content-translation-wrapper'], expanded ? styles['content-translation-wrapper-expanded'] : styles['content-translation-wrapper-collapsed'])}>
      <div
        className={styles['content-translation-title']}
        onClick={() => { setExpanded(!expanded); }}
        onKeyDown={() => { setExpanded(!expanded); }}
      >
        <Tooltip
          arrow
          title={intl.formatMessage(messages.expandCollapse)}
        >
          <span className={styles['setting-content-container-title-expand']}>
            <ButtonMain
              iconCenter={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              size="small"
              theme="lightText"
              variant="contained"
              onClick={() => { setExpanded(!expanded); }}
            />
          </span>
        </Tooltip>
        <strong>{title}</strong>
        { value &&
          <ButtonMain
            iconLeft={<DoneIcon />}
            label={intl.formatMessage(messages.customized)}
            size="small"
            theme="validation"
            variant="text"
            onClick={() => { setExpanded(!expanded); }}
          />
        }
        <div className={styles['setting-content-container-actions']}>
          <Tooltip
            arrow
            title={description}
          >
            <span>
              <ButtonMain
                iconCenter={<HelpIcon />}
                size="small"
                theme="text"
                variant="contained"
                onClick={() => { setExpanded(!expanded); }}
              />
            </span>
          </Tooltip>
        </div>
      </div>
      <div className={styles['content-translation-details']}>
        { !value &&
          <Alert
            className={styles['content-translation-details-default']}
            contained
            content={defaultValue}
            icon={false}
            title={intl.formatMessage(messages.defaultText)}
            variant="info"
          />
        }
        <TextArea
          defaultValue={value}
          error={Boolean(error)}
          helpContent={error}
          key={identifier}
          label={value ? intl.formatMessage(messages.textFieldTitleCustomized) : intl.formatMessage(messages.textFieldTitleDefault)}
          placeholder={intl.formatMessage(messages.placeholder)}
          rows={1}
          rowsMax={Infinity}
          onBlur={(e) => { onUpdate(e.target.value); }}
        />
        {extra}
        { value &&
          <div className={cx(styles['default-bot-response'], defaultExpanded ? styles['default-bot-response-expanded'] : styles['default-bot-response-collapsed'])}>
            <ButtonMain
              iconLeft={defaultExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              label={intl.formatMessage(messages.viewDefault)}
              size="small"
              theme="lightText"
              variant="text"
              onClick={() => { setDefaultExpanded(!defaultExpanded); }}
            />
            <Alert
              className={styles['default-bot-response-content']}
              contained
              content={defaultValue}
              icon={false}
              title={intl.formatMessage(messages.defaultText)}
              variant="info"
            />
          </div>
        }
      </div>
    </div>
  );
};

TiplineContentTranslation.defaultProps = {
  error: null,
  extra: null,
  value: null, // Custom value
};

TiplineContentTranslation.propTypes = {
  defaultValue: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  error: PropTypes.node,
  extra: PropTypes.node,
  identifier: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

export default injectIntl(TiplineContentTranslation);
