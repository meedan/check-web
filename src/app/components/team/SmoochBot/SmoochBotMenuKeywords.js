import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import TagList from '../../cds/menus-lists-dialogs/TagList';
import { withSetFlashMessage } from '../../FlashMessage';

// This is used for the NLU integration

const SmoochBotMenuKeywords = ({
  menu,
  index,
  currentLanguage,
  currentUser,
  keywords: savedKeywords,
  hasUnsavedChanges,
  onUpdateKeywords,
  setFlashMessage,
}) => {
  const [keywords, setKeywords] = React.useState(savedKeywords);
  const [saving, setSaving] = React.useState(false);

  // This feature is enabled only for super-admins and only when editing options
  if (!currentUser?.is_admin) {
    return null;
  }

  const handleError = () => {
    const message = (
      <FormattedMessage
        id="smoochBotMenuKeywords.errorMessage"
        defaultMessage="Could not update NLU keywords"
        description="Error message displayed when NLU keywords for a given tipline menu item can't be updated. NLU stands for Natural Language Understanding."
      />
    );
    setFlashMessage(message, 'error');
    setSaving(false);
  };

  const handleSuccess = () => {
    const message = (
      <FormattedMessage
        id="smoochBotMenuKeywords.successMessage"
        defaultMessage="NLU keywords updated successfully"
        description="Success message displayed when NLU keywords for a given tipline menu item are updated successfully. NLU stands for Natural Language Understanding."
      />
    );
    setFlashMessage(message, 'success');
    setSaving(false);
    onUpdateKeywords();
  };

  const handleToggleKeyword = (keyword, mutation) => {
    setSaving(true);

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          menu,
          keyword,
          menuOptionIndex: index,
          language: currentLanguage,
        },
      },
      onCompleted: (response, error) => {
        if (!error && (response.addNluKeywordToTiplineMenu?.success || response.removeNluKeywordFromTiplineMenu?.success)) {
          handleSuccess();
        } else {
          handleError();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleAddKeyword = (keyword) => {
    const mutation = graphql`
      mutation SmoochBotMenuKeywordsAddNluKeywordToTiplineMenuMutation($input: AddKeywordToTiplineMenuInput!) {
        addNluKeywordToTiplineMenu(input: $input) {
          success
        }
      }
    `;
    handleToggleKeyword(keyword, mutation);
  };

  const handleRemoveKeyword = (keyword) => {
    const mutation = graphql`
      mutation SmoochBotMenuKeywordsRemoveNluKeywordFromTiplineMenuMutation($input: RemoveKeywordFromTiplineMenuInput!) {
        removeNluKeywordFromTiplineMenu(input: $input) {
          success
        }
      }
    `;
    handleToggleKeyword(keyword, mutation);
  };

  const handleSetTags = (newKeywords) => {
    // Adding tag
    if (newKeywords.length > keywords.length) {
      const difference = newKeywords.filter(x => !keywords.includes(x));
      const keyword = difference[0];
      handleAddKeyword(keyword);
    // Deleting tag
    } else if (newKeywords.length < keywords.length) {
      const difference = keywords.filter(x => !newKeywords.includes(x));
      const keyword = difference[0];
      handleRemoveKeyword(keyword);
    }
    setKeywords(newKeywords);
  };

  return (
    <div>
      <p>
        <FormattedMessage
          tagName="span"
          id="smoochBotMenuKeywords.title"
          defaultMessage="Keywords (super-admin only)"
          description="Label for tags component on tipline menu option editing screen."
        />
        <br />
        <FormattedMessage
          tagName="small"
          id="smoochBotMenuKeywords.helperText"
          defaultMessage="Keywords and phrases that should match this menu item for NLU. Changes take effect immediately."
          description="Helper text for tags component on tipline menu option editing screen."
        />
        { hasUnsavedChanges ?
          <span style={{ color: 'var(--color-orange-54)' }}>
            <br />
            <FormattedMessage
              tagName="small"
              id="smoochBotMenuKeywords.helperTextUnsavedChanges"
              defaultMessage="There are unsaved changes to tipline settings. Please 'Publish' the tipline or reload the page and then try again."
              description="Helper text for tags component on tipline menu option editing screen when there are unsaved changes."
            />
          </span> : null
        }
      </p>
      <TagList
        readOnly={saving || hasUnsavedChanges}
        setTags={handleSetTags}
        onClickTag={() => {}}
        options={[]}
        tags={keywords}
        saving={saving}
        customCreateLabel={<FormattedMessage id="smoochBotMenuKeyword.create" defaultMessage="+ Create keyword" description="A label for a button that allows people to create a new NLU keyword." />}
      />
    </div>
  );
};

SmoochBotMenuKeywords.defaultProps = {
  currentUser: null,
  currentLanguage: null,
  index: null,
  keywords: [],
};

SmoochBotMenuKeywords.propTypes = {
  menu: PropTypes.oneOf(['main', 'secondary']).isRequired,
  currentUser: PropTypes.shape({ is_admin: PropTypes.bool.isRequired }),
  currentLanguage: PropTypes.string,
  index: PropTypes.number,
  keywords: PropTypes.arrayOf(PropTypes.string),
  hasUnsavedChanges: PropTypes.bool.isRequired,
  onUpdateKeywords: PropTypes.func.isRequired,
};

export default withSetFlashMessage(SmoochBotMenuKeywords);
