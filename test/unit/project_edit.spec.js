import React from 'react';
import { mountWithIntl, getStore } from './helpers/intl-test';

import { ProjectEditComponent, ProjectEditComponentWithIntl } from '../../src/app/components/project/ProjectEdit';

describe('<ProjectEditComponent />', () => {
  it('forbids empty title', function() {
    const team = { slug: 'team-slug' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const wrapper = mountWithIntl(<ProjectEditComponentWithIntl project={{ title: 'Project', description: 'Description', team }} />);
    let ProjectEdit = wrapper.find(ProjectEditComponent);

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

  it('allows editing title', function() {
    const team = { slug: 'team-slug' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const wrapper = mountWithIntl(<ProjectEditComponentWithIntl project={{ title: 'Project', description: 'Description', team }} />);
    let ProjectEdit = wrapper.find(ProjectEditComponent);

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

  it('allows editing description', function() {
    const team = { slug: 'team-slug' };
    getStore().team = team;
    getStore().dispatch = () => {};

    const wrapper = mountWithIntl(<ProjectEditComponentWithIntl project={{ title: 'Project', description: 'Description', team }} />);
    let ProjectEdit = wrapper.find(ProjectEditComponent);

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
