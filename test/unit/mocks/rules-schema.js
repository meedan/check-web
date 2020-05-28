const schema = {
  "type": "object",
  "properties": {
    "rules": {
      "type": "array",
      "title": "Rules",
      "items": {
        "title": "Rules",
        "type": "object",
        "properties": {
          "name": {
            "title": "A unique name that identifies what this rule does",
            "type": "string"
          },
          "updated_at": {
            "title": "Created",
            "type": "integer"
          },
          "rules": {
            "title": "Condition groups",
            "type": "object",
            "properties": {
              "operator": {
                "title": "Operator",
                "type": "string",
                "enum": ["and", "or"]
              },
              "groups": {
                "title": "Condition groups",
                "type": "array",
                "items": {
                  "title": "Condition group",
                  "type": "object",
                  "properties": {
                    "operator": {
                      "title": "Operator",
                      "type": "string",
                      "enum": ["and", "or"]
                    },
                    "conditions": {
                      "type": "array",
                      "items": {
                        "title": "If",
                        "type": "object",
                        "properties": {
                          "rule_definition": {
                            "title": "Select condition",
                            "type": "string",
                            "enum": [
                              {
                                "key": "contains_keyword",
                                "value": "Request contains one or more of the following keywords"
                              },
                              {
                                "key": "has_less_than_x_words",
                                "value": "Request contains less than the following number of words"
                              },
                              {
                                "key": "tagged_as",
                                "value": "Item is tagged as"
                              },
                              {
                                "key": "flagged_as",
                                "value": "Item is flagged as"
                              },
                              {
                                "key": "status_is",
                                "value": "Item status is"
                              },
                              {
                                "key": "type_is",
                                "value": "Item type is"
                              },
                              {
                                "key": "title_matches_regexp",
                                "value": "Item title matches this regular expression"
                              },
                              {
                                "key": "request_matches_regexp",
                                "value": "Request matches this regular expression"
                              },
                              {
                                "key": "title_contains_keyword",
                                "value": "Item title contains one or more of the following keywords"
                              },
                              {
                                "key": "item_titles_are_similar",
                                "value": "Item titles are similar"
                              },
                              {
                                "key": "item_images_are_similar",
                                "value": "Images are similar"
                              },
                              {
                                "key": "report_is_published",
                                "value": "Report is published"
                              },
                              {
                                "key": "report_is_paused",
                                "value": "Report is paused"
                              }
                            ]
                          }
                        },
                        "allOf": [
                          {
                            "if": {
                              "properties": { "rule_definition": { "enum": ["contains_keyword", "title_contains_keyword"] } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Type a list of keywords separated by commas", "type": "string" } }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "const": "flagged_as" } }
                            },
                            "then": {
                              "properties": {
                                "rule_value": {
                                  "type": "object",
                                  "properties": {
                                    "flag": {
                                      "title": "Select flag", "type": "string", "enum": [{"key":"adult","value":"Adult"},{"key":"spoof","value":"Spoof"},{"key":"medical","value":"Medical"},{"key":"violence","value":"Violence"},{"key":"racy","value":"Racy"}]
                                    },
                                    "threshold": {
                                      "title": "With a likelihood of at least", "type": "string", "enum": [{"key":0,"value":"Unknown"},{"key":1,"value":"Very unlikely"},{"key":2,"value":"Unlikely"},{"key":3,"value":"Possible"},{"key":4,"value":"Likely"},{"key":5,"value":"Very likely"}]
                                    }
                                  }
                                }
                              }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "const": "item_titles_are_similar" } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Distance between item titles", "type": "integer", "minimum": 0, "maximum": 100 } }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "const": "item_images_are_similar" } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Distance between images", "type": "integer", "minimum": 0, "maximum": 100 } }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "const": "has_less_than_x_words" } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Enter the number of words", "type": "integer", "minimum": 1 } }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "const": "type_is" } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Select type", "type": "string", "enum": [{"key":"claim","value":"Text"},{"key":"link","value":"Link"},{"key":"uploadedimage","value":"Image"},{"key":"uploadedvideo","value":"Video"}] } }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "const": "tagged_as" } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Select tag", "type": "string", "enum": [] } }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "const": "status_is" } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Select status", "type": "string", "enum": [{"key":"undetermined","value":"Unstarted"},{"key":"not_applicable","value":"Inconclusive"},{"key":"in_progress","value":"In Progress"},{"key":"false","value":"False"},{"key":"verified","value":"Verified"}] } }
                            }
                          },
                          {
                            "if": {
                              "properties": { "rule_definition": { "enum": ["title_matches_regexp", "request_matches_regexp"] } }
                            },
                            "then": {
                              "properties": { "rule_value": { "title": "Type a regular expression", "type": "string" } }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "actions": {
            "title": "Then",
            "type": "array",
            "items": {
              "title": "Then",
              "type": "object",
              "properties": {
                "action_definition": {
                  "title": "Select action",
                  "type": "string",
                  "enum": [
                    {
                      "key": "move_to_project",
                      "value": "Move item to list"
                    },
                    {
                      "key": "copy_to_project",
                      "value": "Add item to list"
                    },
                    {
                      "key": "relate_similar_items",
                      "value": "Relate items"
                    },
                    {
                      "key": "send_message_to_user",
                      "value": "Send message to user"
                    },
                    {
                      "key": "send_to_trash",
                      "value": "Send to trash"
                    },
                    {
                      "key": "ban_submitter",
                      "value": "Ban submitter (their future messages won't appear in Check)"
                    }
                  ]
                }
              },
              "allOf": [
                {
                  "if": {
                    "properties": { "action_definition": { "enum": ["move_to_project", "copy_to_project"] } }
                  },
                  "then": {
                    "properties": { "action_value": { "title": "Select destination list", "type": "integer", "enum": [] } }
                  }
                },
                {
                  "if": {
                    "properties": { "action_definition": { "const": "send_message_to_user" } }
                  },
                  "then": {
                    "properties": { "action_value": { "title": "Type message here", "type": "string" } }
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
};
module.exports = schema;
