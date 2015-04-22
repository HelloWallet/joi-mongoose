'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.SchemaTypes.ObjectId,
    moment = require('moment'),
    _ = require('lodash');

var SchemaGenerator = function(schema) {
    this.schema = schema;
    this.mappings = {
        'string': String,
        'number': Number,
        'boolean': Boolean,
        'date': Date,
        'objectId': ObjectId
    };
};

function processObject(schemaObject, outputSchema, mappings) {
    for (var elementName in schemaObject) {
        if (schemaObject.hasOwnProperty(elementName)) {
            var element = schemaObject[elementName],
                type = element.type;

            if (type === 'object') {
                var subObject = processObject(element.children, {}, mappings);
                outputSchema[elementName] = subObject;
            } else if (type === 'array') {
                var subArrayObj = processObject(element.items[0].children, {}, mappings);
                outputSchema[elementName] = [subArrayObj];
            } else if (['_id', 'id', '__v'].indexOf(elementName) > -1) {
                // SKIP these default elements
            } else {
                var elementObj = {},
                    dbType = mappings[type],
                    flags = element.flags,
                    metas = element.meta;
                elementObj.type = dbType;

                if (flags) {
                    var required = flags.presence === 'required';
                    elementObj.required = required;
                }

                if (metas) {
                    var metaKeys = Object.keys(metas);
                    for (var metaKey in metaKeys) {
                        if (metas.hasOwnProperty(metaKey)) {
                            var metaObj = metas[metaKey];
                            for (var metaObjKey in metaObj) {
                                if (metaObj.hasOwnProperty(metaObjKey)) {
                                    if (metaObjKey === 'type') {
                                        elementObj.type = mappings[metaObj[metaObjKey]];
                                    } else if (metaObjKey === 'dbAlias') {
                                        elementName = metaObj[metaObjKey];
                                    } else if (metaObjKey === 'defaultMoment') {
                                        elementObj.default = moment[metaObj[metaObjKey]];
                                    } else {
                                        elementObj[metaObjKey] = metaObj[metaObjKey];
                                    }
                                }
                            }
                        }
                    }
                }
                outputSchema[elementName] = elementObj;
            }
        }
    }
    return outputSchema;
}

SchemaGenerator.prototype.processSchema = function(name, typeMappings) {
    var mappings = _.merge(this.mappings, typeMappings);

    console.log('Generate schema for ',name);
    var inputSchema = this.schema.children[name].children;
    var outputSchema = processObject(inputSchema, {}, mappings);
    return outputSchema;
};

module.exports = SchemaGenerator;