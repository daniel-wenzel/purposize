<!-- # Getting started

1. Install mysql
2. Set user credentials to root and 123456 (or move that from the code to a config file, i like `npm i config`)
3. Create a db called `testdb` using the command line
4. `npm i`
5. `node testApplication` -->

# Getting started

1. Install purposize using `npm i purposize`
2. Extend sequelize object using `purposize.init(sequelize)`
3. Define your own models
4. Sync your models to the DB using `sequelize.sync()`
5. Load purposes specification from `.yml` file using `purposize.loadPurposes(filePath)`

```javascript
const Sequelize = require('sequelize')
const purposize = require('purposize')

const sequelize = new Sequelize(...)
purposize.init(sequelize)

sequelize.define('users', {...})
sequelize.sync()
purposize.loadPurposes('./purposes.yml')

```

# Purpose specification

```yaml
purposes:
- name: NEWSLETTER
  relevantFields:
    customers:
      - eMail
- name: ORDER
  relevantFields:
    customers:
      - eMail
      - postalAddress
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
```
