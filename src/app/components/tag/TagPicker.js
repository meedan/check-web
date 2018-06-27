import React from 'react';
import Relay from 'react-relay';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FormGroup, FormControlLabel } from 'material-ui-next/Form';
import CheckboxNext from 'material-ui-next/Checkbox';
import styled from 'styled-components';
import difference from 'lodash.difference';
import intersection from 'lodash.intersection';
import CheckContext from '../../CheckContext';
import { black54, caption, units, opaqueBlack02, opaqueBlack05 } from '../../styles/js/shared';
import RelayContainer from '../../relay/RelayContainer';
import { createTag } from '../../relay/mutations/CreateTagMutation';
import { deleteTag } from '../../relay/mutations/DeleteTagMutation';
import MediaRoute from '../../relay/MediaRoute';

const StyledHeading = styled.div`
  color: ${black54};
  font: ${caption};
`;

const StyledNotFound = styled.div`
  color: ${black54};
  padding-top: ${units(15)};
  display: flex;
  justify-content: center;
`;

const StyledTagPickerArea = styled.div`
  padding: ${units(2)};
  height: ${units(32)};
  overflow-y: auto;
  border: 1px solid ${opaqueBlack05};
  background-color: ${opaqueBlack02};
`;

class TagPickerComponent extends React.Component {
  handleCreateTag(value) {
    const { media } = this.props;

    const context = new CheckContext(this).getContextStore();

    const onSuccess = () => {};
    const onFailure = () => {};

    createTag(
      {
        media,
        value,
        annotator: context.currentUser,
      },
      onSuccess, onFailure,
    );
  }

  handleRemoveTag = (value) => {
    const { media } = this.props;

    const removedTag = this.props.tags.find(tag => tag.node.tag === value);

    const onSuccess = () => {};
    const onFailure = () => {};

    deleteTag(
      {
        media,
        tagId: removedTag.node.id,
      },
      onSuccess, onFailure,
    );
  };

  handleSelectCheckbox = (e, inputChecked) => {
    if (inputChecked) {
      this.handleCreateTag(e.target.id);
    } else {
      this.handleRemoveTag(e.target.id);
    }
  }

  render() {
    const { media, tags, value } = this.props;

    const plainMediaTags = tags.map(tag => tag.node.tag);

    const suggestedTags = media.team && media.team.get_suggested_tags
      ? media.team.get_suggested_tags.split(',').filter(tag => tag.includes(value))
      : [];

    const nonRepeatedUsedTags =
      difference(media.team.used_tags, suggestedTags).filter(tag => tag.includes(value));

    const checkedSuggestedTags = intersection(suggestedTags, plainMediaTags);
    const uncheckedSuggestedTags = difference(suggestedTags, plainMediaTags);

    const checkedUsedTags =
      difference(plainMediaTags, suggestedTags).filter(tag => tag.includes(value));
    const uncheckedUsedTags = difference(nonRepeatedUsedTags, plainMediaTags);

    return (
      <StyledTagPickerArea>
        <FormGroup>
          {
            checkedSuggestedTags.length || uncheckedSuggestedTags.length ?
              <StyledHeading>
                <FormattedMessage id="tagPicker.teamTags" defaultMessage="Team tags" />
              </StyledHeading>
              : null
          }
          {checkedSuggestedTags.map((tag, index) => (
            <FormControlLabel
              key={`team-suggested-tag-checked-${index.toString()}`}
              control={
                <CheckboxNext
                  checked={plainMediaTags.includes(tag)}
                  onChange={this.handleSelectCheckbox}
                  id={tag}
                />
              }
              label={tag}
            />
          ))}
          {uncheckedSuggestedTags.map((tag, index) => (
            <FormControlLabel
              key={`team-suggested-tag-unchecked-${index.toString()}`}
              control={
                <CheckboxNext
                  checked={plainMediaTags.includes(tag)}
                  onChange={this.handleSelectCheckbox}
                  id={tag}
                />
              }
              label={tag}
            />
          ))}
          {
            checkedUsedTags.length || uncheckedUsedTags.length ?
              <StyledHeading>
                <FormattedMessage id="tagPicker.teamOtherTags" defaultMessage="Other tags" />
              </StyledHeading>
              : null
          }
          {checkedUsedTags.map((tag, index) => (
            <FormControlLabel
              key={`team-tag-checked-${index.toString()}`}
              control={
                <CheckboxNext
                  checked={plainMediaTags.includes(tag)}
                  onChange={this.handleSelectCheckbox}
                  id={tag}
                />
              }
              label={tag}
            />
          ))}
          {uncheckedUsedTags.map((tag, index) => (
            <FormControlLabel
              key={`team-tag-unchecked-${index.toString()}`}
              control={
                <CheckboxNext
                  checked={plainMediaTags.includes(tag)}
                  onChange={this.handleSelectCheckbox}
                  id={tag}
                />
              }
              label={tag}
            />
          ))}
        </FormGroup>
        { checkedSuggestedTags.length || uncheckedSuggestedTags.length ||
          checkedUsedTags.length || uncheckedUsedTags.length ? null :
          <StyledNotFound>
            <FormattedMessage
              id="tagPicker.tagNotFound"
              defaultMessage='Tag "{tag}" not found'
              values={{ tag: this.props.value }}
            />
          </StyledNotFound>
        }
      </StyledTagPickerArea>
    );
  }
}

TagPickerComponent.contextTypes = {
  store: PropTypes.object,
};

const TagPickerContainer = Relay.createContainer(TagPickerComponent, {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        tags(first: 10000) {
          edges {
            node {
              tag,
              id
            }
          }
        }
        team {
          used_tags
          get_suggested_tags
        }
      }
    `,
  },
});

const TagPicker = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });

  return (
    <RelayContainer
      Component={TagPickerContainer}
      route={route}
      renderFetched={data => <TagPickerContainer {...props} {...data} />}
    />
  );
};

export default TagPicker;
