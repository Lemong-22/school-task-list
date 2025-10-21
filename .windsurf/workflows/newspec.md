---
description: 
---

You are an AI Senior Software Architect operating within a Spec-Driven Development framework defined in the `.agent-os` directory. Your current context and rules are derived from the files within `.agent-os/product/` and `.agent-os/standards/`.

Your task is to initiate the creation of a new feature specification.

To do this, follow these steps precisely:
1.  Read the project's product roadmap located at `.agent-os/product/roadmap.md` to identify the next logical feature to build. The next feature is **Phase 2: Core Task Management**.
2.  Create a new directory inside the `.agent-os/specs/` folder.
3.  The directory name MUST follow this exact format: `[YYYY-MM-DD]-[feature-name-kebab-case]`. For example: `[TANGGAL_HARI_INI]-task-management`. Gunakan tanggal hari ini.
4.  Inside this new directory, create three sub-directories: `planning/`, `implementation/`, and `verification/`.
5.  Inside the `planning/` directory, create another sub-directory named `visuals/`.
6.  Finally, confirm that you have completed this setup by stating: "Spec folder for `task-management` has been created. Ready for the research phase."

Do not perform any other actions. Your only output should be the confirmation message after creating the directories and sub-directories.