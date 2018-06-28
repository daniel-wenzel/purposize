<!-- # Getting started

1. Install mysql
2. Set user credentials to root and 123456 (or move that from the code to a config file, i like `npm i config`)
3. Create a db called `testdb` using the command line
4. `npm i`
5. `node testApplication` -->

# Getting started

1. Install purposize using `npm i purposize`
2. Extend sequelize instance using `purposize.init(sequelize)`
3. Define your own models
4. Use `isPersonalData: true` to mark data fields as personal data
5. Sync your models to the DB using `sequelize.sync()`
6. Load purposes specification from `.yml` file using `purposize.loadPurposes(filePath)`

```javascript
const Sequelize = require('sequelize')
const purposize = require('purposize')

const sequelize = new Sequelize(...)
purposize.init(sequelize)

sequelize.define('customers', {
  eMail: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  postalAddress: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  unfulfilledOrders: {
    type: Sequelize.INTEGER
  }
})
sequelize.sync()
purposize.loadPurposes('./purposes.yml')

```

# Purpose specification

## Explanation of keys

Key Name | Explanation
--- | ---
purposes | List of all purposes
name | Name of the purpose
relevantFields | Specifies the data fields that are relevant to the specific purpose for each table. Make sure that the table name corresponds to your sequelize model name and the field names correspond to your column names (data fields in your model).
retentionPeriod | Specifies the maximum storage duration for the data fields linked to this purpose. Storage duration must be a number and is treated as days. Default is `-1` which means the data is stored infinitly.
loggingLevel | Specifies which database interactions should be logged. Must be one of the following values: `ACCESS`, `CHANGE` or `ALL`. See logging level specification for more details. Default is `NONE`.

### Logging Levels

We have specified the following logging levels

Logging level | Explanation
--- | ---
`ACCESS` | A log entry is only created whenever data is accessed for the specific purpose
`CHANGE` | A log entry is created only when the specific purpose for a certain data item has been added or removed 
`ALL` | A log entry is created for every interaction connected to the specific purpose.
`NONE` | No log entries are made for the specific purpose (Default)


## Example
```yaml
# purposes.yml

purposes:
- name: NEWSLETTER
  relevantFields:
    customers:
      - eMail
  loggingLevel: CHANGE
- name: ORDER
  relevantFields:
    customers:
      - eMail
      - postalAddress
  retentionPeriod: 60 
  loggingLevel: ACCESS
  compatibleWith:
    - MONTHLY_DELIVERY
- name: FULFILLMENT
  relevantFields:
    customers:
      - postalAddress
  compatibleWith:
    - ORDER
- name: MONTHLY_DELIVERY
  relevantFields:
    customers:
      - eMail
      - postalAddress
  loggingLevel: CHANGE
```
