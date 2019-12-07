# Purposize

Purposize is a [sequelize](http://docs.sequelizejs.com/) plugin to help with technically enforcing purpose limitation. 

The European General Data Protection Regulation ([GDPR](https://gdpr-info.eu/)) forces the "controller" to explicitly specify purposes for collecting, processing and storing personal data. This tool is designed to technically implement the concept of purpose limitation ([GDPR Art. 5(1b)](https://gdpr-info.eu/art-5-gdpr/)) and to help with provable compliance.

#### **PURPOSIZE IS STILL WORK IN PROGRESS**

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

const Customer = sequelize.define('customer', {
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
await sequelize.sync()
await purposize.loadPurposes('./purposes.yml')
```

## Creating instances

When creating instances that should contain personal data you must specify a purpose within the `options` object using the `purpose` key. The purpose may either be a string or an array of strings.

The personal data fields that you want to store must match with the relevant fields from your `yaml` specification.

When specifying only non-personal attributes the purpose field can be omitted.

**The returned instance only contains non-personal attributes** <br> The reason is to prevent any data leaks. Furthermore, every access of personal data must be bound to one specific purpose!

```javascript
const alice = await Customer.create({
  eMail: "alice@email.com",
  postalAddress: "1234 Shoppington",
}, {
  purpose: 'ORDER'
  // purpose: ['ORDER', 'NEWSLETTER']
})

// Keep in mind: only non-personal data is returned!
// alice.eMail and alice.postalAddress will be undefined

const bob = await Customer.create({
  unfulfilledOrders: 2
})
// No purpose needed since unfulfilledOrders is a non-personal attribute
```

## Querying instances

Querying works as usual with the exeception that you have to provide a purpose when wanting to retrieve personal data. When adding personal data fields to the `attributes` array (`SELECT` statement) or `where` object (`WHERE` statement) you must provide a purpose that legitimizes the access of those personal data fields. The purpose in queries is specified using the `purpose` key and must be of type `string`. 

The returned result may contain instances that have been stored for exactly the specified purpose but also compatible purposes. Every instance only contains all non-personal attributes together with the legitimized personal attributes. All other personal attributes that are not legitimized by the specified purpose are stripped out and are not returned.

When no purpose is specified, the query result only contains non-personal data.

```javascript
const result = await Customer.findAll({
  attributes: [ ... ]
  where: { ... },
  purpose: 'NEWSLETTER'
})

// Result contains instances that have been stored for the purpose NEWSLETTER or other compatible purposes.
// Every instance contains all non-personal attributes (in this example: unfulfilledOrders) together with the legitimized personal data attributes (in this example: eMail).

```

## Updating instances

When updating already existing attributes you can simply call the `save` or `update` method with no further options.

When wanting to add a new personal data field to an instance you must again specify a purpose that legitimizes the storage. It works the same as creating an instance. You need to set the `purpose` key within the `options` object.

**The returned instance only contains non-personal attributes**

```javascript
// Adding no personal data fields
const alice = await Customer.findOne({ 
  where: {
    eMail: "alice@email.com"
  },
  purpose: 'ORDER'
})

alice.eMail = "alison@mail.de"
alice.postalAddress = "9876 Cheapcity"
await alice.save()

// Adding new personal data fields
const bob = await Customer.findOne({ 
  where: {
    unfulfilledOrders: 2
  }
})

bob.eMail = "bob@email.com"
await bob.save({
  purpose: 'NEWSLETTER'
})

// Updating also works through the instance.update method
await bob.update({
  eMail: "bobby@mail.de"
})
```

# Purpose specification

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

## Explanation of keys

Key Name | Explanation
--- | ---
purposes | List of all purposes
name | Name of the purpose
relevantFields | Specifies the data fields that are relevant to the specific purpose for each table. Make sure that the key for each table corresponds to the actual table name (NOT your sequelize model name!) and the field names correspond to the actual column names (data fields in your sequelize model).
retentionPeriod | Specifies the maximum storage duration for the data fields linked to this purpose. Storage duration must be a number and is treated as days. Default is `-1` which means the data is stored infinitly. <br><br> **After the retention period has expired the personal data attributes will automatically be deleted!**
loggingLevel | Specifies which database interactions should be logged. Must be one of the following values: `ACCESS`, `CHANGE` or `ALL`. See logging level specification for more details. Default is `NONE`.
compatibleWith | Specifies all the other purposes this specific purpose is compatible with.

### Logging Levels

We have specified the following logging levels

Logging level | Explanation
--- | ---
`ACCESS` | A log entry is only created whenever data is accessed for the specific purpose
`CHANGE` | A log entry is created only when the specific purpose for a certain data item has been added or removed 
`ALL` | A log entry is created for every interaction connected to the specific purpose.
`NONE` | No log entries are made for the specific purpose (Default)

# Purposize Options

You can initialize purposize with some options.

```javascript
const Sequelize = require('sequelize')
const purposize = require('purposize')

const sequelize = new Sequelize(...)
purposize.init(sequelize, {
  deletionCheckInterval: 1*60*60*1000
})
```
Available Options

Option | Explanation | Default
--- | --- | ---
`deletionCheckInterval` | Determines how often purposize automatically checks for data instances whose retention period for a specific purpose has expired. As soon as purposize detects outdated storage purposes, the personal data attributes linked to the outdated purpose are deleted (if there is no other purpose that legitimizes the storage of the personal data attributes). <br><br> Must be a number given in milliseconds and must be greater than 1 hour (3600000 ms). | `21600000` (6 hours)
`logging` | Determines if purposize creates log entries. Must be a boolean. | `true`
`logFunction` | Custom logging function that can be provided. Receives the log string as input. Must be a function. | `console.log`


# Modified Methods

### Sequelize Instance

* sequelize.define
* sequelize.sync

### TableDAO

* tableDAO.findAll

### Instance

* instance.save

# New Methods on Instances

* instance.addPurpose

```javascript
const carl = await Customer.create({
  eMail: "carl@email.com",
  unfulfilledOrders: 3,
}, {
  purpose: 'NEWSLETTER'
})

await carl.addPurpose('ORDER')
```

* instance.removePurpose (Be careful: This method deletes unnecessary personal data fields that are not legitimized by any other purpose!)

```javascript
const carl = await Customer.create({
  eMail: "carl@email.com",
  unfulfilledOrders: 3,
}, {
  purpose: 'NEWSLETTER'
})

await carl.removePurpose('NEWSLETTER')
// This will delete the eMail attribute on carl if there is no other purpose that legitimizes the storage of carl's email
```