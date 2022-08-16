## Description

Please include a summary of the change and which issue is fixed. Please also include relevant motivation and context.

References: TICKET-ID-1, TICKET-ID-2, …, TICKET-ID-N

## Type of change

- [ ] Performance improvement and/or refactoring (non-breaking change that keeps existing functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Automated test (add or update automated tests)

## How has this been tested?

Please describe the tests that you ran to verify your changes. Provide instructions so we can verify the changes. Please describe whether or not you implemented automated tests.

## Things to pay attention to during code review

Please describe parts of the change that require extra attention during code review, for example:

- File FFFF, line LL: This refactoring does this and this. Is it consistent with how it’s implemented elsewhere?
- Etc.

## Checklist

- [ ] I have performed a self-review of my own code
- [ ] I have commented my code in hard-to-understand areas, if any
- [ ] I have made needed changes to the README
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] If I implemented any new components, they are self-contained, their `propTypes` are declared and they use React Hooks and, if data-fetching is required, they use Relay Modern with fragment containers
- [ ] I have removed the /* eslint-disable @calm/react-intl/missing-attribute */ from any files I've worked on and added a `description` prop to all `<FormattedMessage />` components that were missing it.
- [ ] To the best of my knowledge, any new styles are applied according to the design system
- [ ] If I added a new external dependency, I included a rationale for doing so and an estimate of the change in bundle size (e.g., checked in https://bundlephobia.com/)

