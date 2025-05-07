import React from "react";
import { shallowWithIntl } from "../../../../test/unit/helpers/intl-test";
import { Webhooks } from "./Webhooks";

const team = {
  webhooks: {
    edges: [
      {
        node: {
          dbid: 1,
          id: "abc123",
          name: "Test Webhook",
          events: [{ event: "publish_report" }],
          request_url: "https://example.com/webhook",
        },
      },
      {
        node: {
          dbid: 2,
          id: "def456",
          name: "Another Webhook",
          events: [{ event: "publish_report" }],
          request_url: "https://example.com/webhook2",
        },
      },
    ],
  },
};

describe("<Webhooks />", () => {
  it("should render the webhook entries", () => {
    const wrapper = shallowWithIntl(<Webhooks team={team} />);
    expect(wrapper.find('InjectIntl(WebhookEdit)')).toHaveLength(1);
    expect(wrapper.find('ForwardRef(Relay(InjectIntl(WebhookEntry)))')).toHaveLength(2);
  });

  it("should render the empty state", () => {
    const wrapper = shallowWithIntl(<Webhooks team={{ webhooks: { edges: [] } }} />);
    expect(wrapper.find('InjectIntl(WebhookEdit)')).toHaveLength(1);
    expect(wrapper.find('ForwardRef(Relay(InjectIntl(WebhookEntry)))')).toHaveLength(0);
    expect(wrapper.find('FormattedMessage[id="webhooks.empty"]')).toHaveLength(1);
  });
});
