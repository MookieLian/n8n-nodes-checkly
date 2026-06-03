# @mookielianhd/n8n-nodes-checkly

An [n8n](https://n8n.io) community node for [Checkly](https://www.checklyhq.com) — the synthetic monitoring and API checking platform. Manage checks, alert channels, dashboards and more, and trigger workflows when Checkly raises an alert.

This package contains two nodes:

- **Checkly** — a regular (action) node for the Checkly REST API.
- **Checkly Trigger** — a webhook trigger that fires when a check fails, recovers, degrades, or an SSL certificate is expiring.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Trigger](#trigger) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and use the package name `@mookielianhd/n8n-nodes-checkly`.

## Credentials

The nodes authenticate with a Checkly API key and your account ID.

1. **API Key** — create a User or Service API key in Checkly under **User Settings → API keys** (or **Account Settings → API keys** for a service key).
2. **Account ID** — copy it from **Account Settings → General**.

Both values are sent on every request (`Authorization: Bearer <API Key>` and `X-Checkly-Account: <Account ID>`). Use the **Test** button on the credential to confirm they are valid.

## Operations

The **Checkly** node supports the following resources and operations:

| Resource | Operations |
| --- | --- |
| Check | Create (API / Browser), Get, Get Many, Update, Delete |
| Check Group | Create, Get, Get Many, Update, Delete |
| Check Result | Get, Get Many |
| Check Status | Get, Get Many |
| Alert Channel | Create, Get, Get Many, Delete, Subscribe |
| Dashboard | Create, Get, Get Many, Update, Delete |
| Snippet | Create, Get, Get Many, Update, Delete |
| Environment Variable | Create, Get, Get Many, Update, Delete |
| Maintenance Window | Create, Get, Get Many, Update, Delete |
| Location | Get Many |
| Runtime | Get, Get Many |

Create and update operations expose the most common fields directly. For anything else the API
accepts, use the **Additional Body Fields (JSON)** input (or, for alert channels, the **Config (JSON)**
field) to supply the raw payload. See the [Checkly API reference](https://www.checklyhq.com/docs/api-reference/).

## Trigger

The **Checkly Trigger** node listens for Checkly alerts via a webhook.

When you activate a workflow containing this node, it automatically creates a **webhook alert channel**
in your Checkly account pointing at the n8n webhook URL, and subscribes it according to the **Subscribe To**
setting (all checks, a specific check, or a specific check group). When the workflow is deactivated, the
alert channel is removed again.

- **Events** — choose which events fire the workflow (failed, recovered, degraded, SSL expiring).
- **Verify Signature** — when enabled, requests whose `x-checkly-signature` header does not match the
  generated secret are rejected.

## Compatibility

- Requires n8n with `n8nNodesApiVersion` 1.
- Built and tested against the Checkly public API v1 (`https://api.checklyhq.com`).

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Checkly API reference](https://www.checklyhq.com/docs/api-reference/overview/)
- [Checkly webhook alerting](https://www.checklyhq.com/docs/alerting-and-retries/webhooks/)
