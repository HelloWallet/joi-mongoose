# joi-mongoose
JOI Schema to Mongoose Schema Generator

## Installation
In package.json, add joi-mongoose:
```json 
"joi-mongoose": "git://github.com/HelloWallet/joi-mongoose.git#1.0.0"
```

## Usage
```javascript
var userSchema = Joi.object({
  _id: Joi.string().meta({primaryKey: true}),
  userId: Joi.string().required().meta({type: 'objectId', index: true}),
  name: Joi.string().optional().allow(''),
  isValid: Joi.boolean().required().meta({default: true})
});
var joiMongoose = require('joi-mongoose');
var generator = new joiMongoose(userSchema);
var mongooseSchema = generator.processSchema('user');

// If no type mappings are specified, the defaults are used.
// Additional mappings for custom Joi types can be passed in and will be merged in to the mappings object.
var Currency = require('Currency');
var typeMappings = {
  "currency": Currency
};
var employeeSchema = Joi.object({
  _id: Joi.string().meta({primaryKey: true}),
  employeeId: Joi.string().required().meta({type: 'objectId', index: true}),
  name: Joi.string().optional().allow(''),
  income: Joi.currency().required().meta({default: Currency.zero})
});
var mongooseSchema = generator.processSchema(schemaName, typeMappings);
```

## Meta Flags
Any options passed to meta will be ignored by JOI, but will either be processed by the generator or applied directly to the mongoose schema.

Processed meta flags:
- type: Gets type Object value from type string using mappings
- dbAlias: Changes property name in database
- defaultMoment: Default value for moment dates
