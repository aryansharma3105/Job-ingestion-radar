# Engineering Decisions

## 1. Why this ingestion strategy over the obvious alternative we rejected?

We decided to ingest data through a public API-based approach, taking advantage of the Remotive public jobs API, as opposed to scraping protected job platforms like LinkedIn, Indeed or Naukri directly.

The obvious approach was to scrape these platforms in the browser. We excluded those because they actively detect and limit access from automated agents, and scraping them would introduce unnecessary reliability, maintenance, and Terms of Service risk to this challenge.

Even with a permissible public API, we can still demonstrate the core ingestion engineering we wanted to show, including request timeouts, retry and exponential backoff, rate-limit handling, response validation, normalization, deduplication and stale-data recovery.

We also isolated the Remotive-specific parsing behind a source adapter, so another public source can be added later without modification of the core ingestion pipeline.

## 2. One trade-off you made under the time limit, and what you’d do with a real week.

With the time limit we decided to support one public job source (Remotive) instead of creating and supporting several source adapters. This let us focus on the reliability of the ingestion pipeline (validation, retries, rate-limit handling, deduplication, stale-data recovery) instead of trying to do everything at once.

With a full week we would extend support to other allowable sources of public jobs via the same adapter architecture, improve automated integration and failure testing, add more detailed monitoring and alerting, and evaluate PostgreSQL for more scalable persistent storage.

## 3. Where did you use AI tools, and what did you personally verify or change afterward?

We leveraged AI tools during development to assist with project structure, boilerplate code, debugging, documentation, and test scaffolding. They were also used to aid in thinking about the ingestion architecture and possible failure scenarios.

I can personally vouch for the core parts of the implementation: Remotive source adapter, data normalization and validation, retry and exponential backoff logic, rate-limit handling, deduplication, SQLite operations, API endpoints, frontend-to-backend communication, deployment configuration.

I have tested the application with real data from Remotive and checked the main failure scenarios instead of generating code without verification. I also went through the generated implementation and changed things where needed to keep the system understandable and to be able to explain the engineering decisions in the follow-up discussion.
