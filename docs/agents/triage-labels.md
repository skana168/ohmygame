# Triage labels

Use these canonical roles as values in each local ticket’s `Status:` line.

| Role            | Status value    | Meaning                                 |
| --------------- | --------------- | --------------------------------------- |
| needs-triage    | needs-triage    | Maintainer needs to evaluate the issue  |
| needs-info      | needs-info      | Waiting on the reporter for information |
| ready-for-agent | ready-for-agent | Fully specified and ready for an agent  |
| ready-for-human | ready-for-human | Requires human implementation           |
| wontfix         | wontfix         | Will not be actioned                    |

When a skill asks to apply a triage label, update the ticket’s `Status:`
line to the corresponding value.
