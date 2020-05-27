const rules = [
  {
    name: 'Rule 1',
    updated_at: parseInt(new Date().getTime() / 1000, 10),
    rules: {
      operator: 'and',
      groups: [
        {
          operator: 'or',
          conditions: [
            {
              rule_definition: 'contains_keyword',
              rule_value: 'test',
            },
            {
              rule_definition: 'contains_keyword',
              rule_value: 'foo',
            },
          ],
        },
        {
          operator: 'and',
          conditions: [
            {
              rule_definition: 'has_less_than_x_words',
              rule_value: 4,
            },
            {
              rule_definition: 'contains_keyword',
              rule_value: 'bar',
            },
          ],
        },
      ],
    },
    actions: [
      {
        action_definition: 'move_to_project',
        action_value: 2,
      },
    ],
  },
  {
    name: 'Rule 2',
    updated_at: parseInt(new Date().getTime() / 1000, 10),
    rules: {
      operator: 'or',
      groups: [
        {
          operator: 'and',
          conditions: [
            {
              rule_definition: 'contains_keyword',
              rule_value: 'test',
            },
            {
              rule_definition: 'contains_keyword',
              rule_value: 'foo',
            },
          ],
        },
      ],
    },
    actions: [
      {
        action_definition: 'move_to_project',
        action_value: 3,
      },
      {
        action_definition: 'move_to_project',
        action_value: 4,
      },
    ],
  },
];
module.exports = rules;
