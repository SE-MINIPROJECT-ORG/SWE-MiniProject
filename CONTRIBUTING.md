# Contributing Guidelines

These rules apply to every team member. Every member must contribute through their own GitHub account so that commits are attributable.

## Branching Strategy

- `main` is protected. Nobody pushes directly to it.
- All work happens on short-lived branches created from the latest `main`.

Branch naming: `<type>/<member>-<short-description>`

| Type | Use for | Example |
|------|---------|---------|
| `feature` | New functionality | `feature/varun-login-api` |
| `fix` | Bug fixes | `fix/thanishq-event-date-validation` |
| `docs` | Documentation | `docs/nithin-srs-checkin` |
| `test` | Tests only | `test/vishruta-registration-tests` |
| `chore` | Config, CI, tooling | `chore/varun-eslint-setup` |

## Commit Messages

Format: `<type>: <short summary in present tense>`

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.

Examples:
- `feat: add JWT login endpoint`
- `docs: add SRS section for event registration`
- `test: add unit tests for waitlist logic`

Rules: keep the summary under 72 characters, make small focused commits, and reference the issue when one exists (`feat: add login endpoint (#12)`).

## Pull Request Process

1. Push your branch and open a pull request into `main`.
2. Fill in the PR template completely.
3. Link the related issue using `Closes #<number>`.
4. At least **one teammate other than the author** must review and approve.
5. All CI checks must pass.
6. Resolve all review comments, then the repo owner merges using **Squash and merge** or **Merge commit**.
7. Delete the branch after merging.

Review rotation for the team: Varun is reviewed by Thanishq, Thanishq by Vishruta, Vishruta by Nithin, and Nithin by Varun. Any teammate may add extra reviews.

## Code Standards

- Keep code modular: one responsibility per module, no business logic in route handlers or UI components.
- Meaningful names, no dead code, no commented-out code.
- Every new function or endpoint ships with unit tests.
- Never commit secrets. Use `.env` locally and keep an `.env.example` in the repo.
- Follow the SRS, SAD and Test Plan. Any deviation must be documented in the PR description.

## Definition of Done

A story is done only when:
- [ ] Code is merged to `main` through an approved PR
- [ ] Unit tests are written and passing
- [ ] CI pipeline is green
- [ ] Related documentation is updated
- [ ] The acceptance criteria in the linked issue are met

## Issues and Backlog

- Every piece of work starts as a GitHub issue (user story, bug or task) using the provided templates.
- Each user story carries a requirement ID from the SRS, story points and one assignee.
- Issues are tracked on the GitHub Project board.
