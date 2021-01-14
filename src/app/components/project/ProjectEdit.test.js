import React from 'react';
import { FlashMessageSetterContext } from '../FlashMessage';
import { mountWithIntl, getStore } from '../../../../test/unit/helpers/intl-test';
import { ProjectEditComponent, ConnectedProjectEditComponent } from './ProjectEdit';

/**
 * Return { wrapper: <ConnectedProjectEditComponent {...props}>, setFlashMessage: spy() }.
 */
const createWrapper = (props) => {
  const setFlashMessage = jest.fn();
  const wrapper = mountWithIntl(
    <FlashMessageSetterContext.Provider value={setFlashMessage}>
      <ConnectedProjectEditComponent {...props} />
    </FlashMessageSetterContext.Provider>,
  );
  return { wrapper, setFlashMessage };
};

describe('<ProjectEditComponent />', () => {
  it('forbids empty title', () => {
    const team = { slug: 'team-slug', name: 'A Team' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const { wrapper } = createWrapper({ project: { title: 'Project', description: 'Description', team } });
    const ProjectEdit = wrapper.find(ProjectEditComponent);

    let saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).toEqual(true);

    let descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).toEqual('Project');

    ProjectEdit.setState({ title: '' });

    descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).toEqual('');

    saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).toEqual(true);
  });

  it('allows editing title', () => {
    const team = { slug: 'team-slug', name: 'A Team' };
    getStore().team = team;
    getStore().dispatch = () => {};
    const { wrapper } = createWrapper({ project: { title: 'Project', description: 'Description', team } });
    const ProjectEdit = wrapper.find(ProjectEditComponent);

    let saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).toEqual(true);

    let descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).toEqual('Project');

    ProjectEdit.setState({ title: 'Edited project' });

    descriptionField = wrapper.find('#project-title-field').at(1);
    expect(descriptionField.prop('value')).toEqual('Edited project');

    saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).toEqual(false);
  });

  it('allows editing description', () => {
    const team = { slug: 'team-slug', name: 'A Team' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const { wrapper } = createWrapper({ project: { title: 'Project', description: 'Description', team } });
    const ProjectEdit = wrapper.find(ProjectEditComponent);

    let saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).toEqual(true);

    let descriptionField = wrapper.find('#project-description-field').at(1);
    expect(descriptionField.prop('value')).toEqual('Description');

    ProjectEdit.setState({ description: 'Edited description' });

    descriptionField = wrapper.find('#project-description-field').at(1);
    expect(descriptionField.prop('value')).toEqual('Edited description');

    saveButton = wrapper.find('.project-edit__editing-button--save button');
    expect(saveButton.prop('disabled')).toEqual(false);
  });
});
