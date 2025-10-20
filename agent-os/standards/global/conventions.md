## General Development Conventions

- **Separate Logic into Custom Hooks**: Business logic (e.g., fetching data from Supabase, state management for a feature) MUST be separated into custom hooks (e.g., `useTasks.ts`, `useAuth.ts`) to keep components clean and reusable.
- **Environment Configuration**: Use environment variables for configuration; never commit secrets or API keys to version control. API keys and URLs for Supabase MUST be stored in a `.env` file and accessed via `import.meta.env`.
- **Consistent Project Structure**: Organize files and directories in a predictable, logical structure that team members can navigate easily.
- **Clear Documentation**: Maintain up-to-date README files with setup instructions, architecture overview, and contribution guidelines.
- **Version Control Best Practices**: Use clear commit messages, feature branches, and meaningful pull/merge requests with descriptions.
- **Dependency Management**: Keep dependencies up-to-date and minimal; document why major dependencies are used.
- **Code Review Process**: Establish a consistent code review process with clear expectations for reviewers and authors.
- **Testing Requirements**: Define what level of testing is required before merging (unit tests, integration tests, etc.).
- **Feature Flags**: Use feature flags for incomplete features rather than long-lived feature branches.
- **Changelog Maintenance**: Keep a changelog or release notes to track significant changes and improvements.