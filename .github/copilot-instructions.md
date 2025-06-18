# IEM VTEC App Repo

Every time you choose to apply a rule(s), explicitly state the rule(s) in the output. 
You can abbreviate the rule description to a single word or phrase.

## Rules

- **NO MOCKS EVER** 
  - Do not use mocks in any tests. All tests should use real data and real
    components. If you decide a mock is needed, please have me approve it
    first and provide a valid reason why a mock is necessary.
- Do not add code comments detailing what you modified. Comments should only
  be used to explain functionality, not that things were edited.
- Do not attempt to run node for testing purposes.
- Do not use Jquery and replace any jQuery code with vanilla JavaScript.
- Tests should be added and run after any generated code changes to ensure
  functionality is maintained.
- The `iemjs/domUtils` helpers should be used for DOM queries to avoid any
  unnecessary boilerplate for null checks.  The general policy is that all
  dom elements are expected to exist.
- Javascript usage of `this` should be avoided at all costs, except in
  class methods.
- `src/main.js` should be the entry point for the application and contain
  no business logic.
