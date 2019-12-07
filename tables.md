# Purposize Metadata Tables

We have the following tables to manage purposes:

- **Purposes**: List of all defined purposes
- **personalDataFields**: Lists which fields in which table contains personal data
- **purposeDataFields**: Lists which personal data fields are relevant for which purpose
- **compatiblePurposes**: Stores the compatibility relationships between different purposes
- **${TableName}Purposes**: (e.g. OrdersPurposes for Orders): For every table it stores which table row is stored for which purposes
