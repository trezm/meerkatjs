var mongoose = require('mongoose');
var generatedDeltaModels = {};

var Meerkat = {
	deltaModel: function(schemaDefinition, name) {
		if (!generatedDeltaModels[name]) {
			var deltaSchema = this.generateDeltaSchema(schemaDefinition, name);
			generatedDeltaModels[name] = mongoose.model(name + 'Delta', deltaSchema);
		}
		
		return generatedDeltaModels[name]
	},

	Schema: function(schemaDefinition, name) {
		var privateSchema = this.generatePrivateSchema(schemaDefinition);
		privateSchema.versionNumber = {
			type: Number,
			default: 1
		}

		privateSchema.delta = {
			type: mongoose.Schema.ObjectId,
			ref: name + "Delta"
		}

		var mongooseSchema = mongoose.Schema(privateSchema);
		var DeltaModel = this.deltaModel(schemaDefinition, name);
		this.generateVirtualMethods(mongooseSchema, schemaDefinition, DeltaModel);

		// Add in the difference function
		mongooseSchema.pre('save', function(next) {
			var hasChanged = false;

			if (this._delta && this._id) {
				var oldDelta = this.delta;

				this.versionNumber++;
				this._delta.previousDelta = oldDelta;
				this._delta.linkedDocument = this;
				this.delta = this._delta;

				this._delta.save(function(error, results) {
					next();
				});

				this._delta = null;
			} else {
				next();
			}
		});

		var recallVersion = function(target, current, model, delta, callback) {
			if (target == current) {
				callback(null, model);
			} else {
				DeltaModel.findOne({_id: delta}, function(error, results) {
					current--;
					for (var key in results) {
						if (results[key] instanceof Buffer) {
							model[key] = module.exports.applyDelta(model[key], results[key])
						}
					}

					model.versionNumber = current;
					recallVersion(target, current, model, results.previousDelta, callback);
				})
			}
		}

		mongooseSchema.set('toObject', {getters: true});
		mongooseSchema.set('toJSON', {getters: true});
		mongooseSchema.methods.getVersion = function(versionNumber, callback) {
			if (versionNumber < this.versionNumber && versionNumber > 0) {
				recallVersion(versionNumber, this.versionNumber, this, this.delta, callback);
			} else {
				callback(null, this);
			}
		}

		return mongooseSchema;
	},

	model: function(name, schema) {
		var mongooseModel = mongoose.model(name, schema);

		var insertUnderscores = function(params) {
			var alteredParams = {};
			for (var key in params) {
				alteredParams['_' + key] = params[key];
			}

			return alteredParams
		}

		var legacyFind = mongooseModel.find;
		mongooseModel.find = function() {
			arguments[0] = insertUnderscores(arguments[0])

			legacyFind.apply(mongooseModel, arguments);
		}

		var legacyFindOne = mongooseModel.findOne;
		mongooseModel.findOne = function() {
			arguments[0] = insertUnderscores(arguments[0])

			legacyFindOne.apply(mongooseModel, arguments);
		}

		return mongooseModel;

	},

	generateDeltaSchema: function(schemaDefinition, name) {
		var deltaSchema = {};
		for (var key in schemaDefinition) {
			deltaSchema[key] = Buffer;
		}

		deltaSchema.linkedDocument = {
			type: mongoose.Schema.ObjectId,
			ref: name
		}

		deltaSchema.previousDelta = {
			type: mongoose.Schema.ObjectId,
			ref: name + "Delta"
		}

		return deltaSchema;
	},

	generatePrivateSchema: function(schemaDefinition) {
		var privateSchema = {};
		for (var key in schemaDefinition) {
			privateSchema["_" + key] = schemaDefinition[key]
		}

		return privateSchema;
	},

	generateVirtualMethods: function(schema, schemaDefinition, DeltaModel) {
		var self = this;
		var setupSchema = function(key) {
			schema.virtual(key)
				.get(function() {
					return this["_" + key];
				})
				.set(function(value) {
					if (this['_' + key] && value != this['_' + key]) {
						if (!this._delta) {
							this._delta = new DeltaModel();
						}

						this._delta[key] = self.calculateDelta(value, this['_' + key])
					}
					this.set("_" + key, value);
				})
		}

		for (var key in schemaDefinition) {
			setupSchema(key);
		}
	},

	calculateDelta: function(moreRecent, lessRecent) {
		moreRecent = moreRecent.toString();
		lessRecent = lessRecent.toString();
		var moreRecent = new Buffer(moreRecent);
		var lessRecent = new Buffer(lessRecent);

//		var diff = new Buffer(Math.max(lessRecent.length, moreRecent.length));
		var diff = new Buffer(lessRecent.length);
		var index = 0;
		var results = [];
		for (var i = 0; i < diff.length; i++) {
			diff[i] = moreRecent[i] ^ lessRecent[i];
		}

		return diff;
	},

	applyDelta: function(moreRecent, diff) {
		var moreRecent = moreRecent.toString();
		var moreRecent = new Buffer(moreRecent);
		var lessRecent = new Buffer(diff.length);

		for (var i = 0; i < lessRecent.length; i++) {
			lessRecent[i] = moreRecent[i] ^ diff[i];
		}

		return lessRecent.toString();
	}
}

module.exports = Meerkat;