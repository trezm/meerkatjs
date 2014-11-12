var utils = require('./test_config.js');
var settings = require('../settings');

var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var expect = require('chai').expect;
var mongoose = require('mongoose');

var meerkat = require('../lib/meerkat');

describe('Mongoose Extensions', function() {
	var testSchemaObject = {
		testField1: {
			type: String
		},

		testField2: {
			type: Number
		}
	}

	var TestModel;
	var DeltaModel;

	before(function(done) {
		var TestSchema = meerkat.Schema(testSchemaObject, 'Test');
		TestModel = meerkat.model('Test', TestSchema);
		DeltaModel = meerkat.deltaModel(testSchemaObject, 'Test');

		done();
	})

	it('should have a Schema function', function() {
		expect(meerkat).to.respondTo('Schema');
	});

	it('should have a model function', function() {
		expect(meerkat).to.respondTo('model');
	})

	it('should create a delta model when a model is created', function(done) {
		async.waterfall([

			function(callback) {
				var testModel = new TestModel();
				testModel.testField1 = 'Hello world';
				testModel.testField2 = 42;
				testModel.save(function(error, results) {
					callback(error, results);
				});
			},
			function(results, callback) {
				results.testField1 = 'Goodbye world';
				results.save(function(error, results) {
					callback(error, results);
				});
			},
			function(results, callback) {
				DeltaModel.findOne({}, function(error, results) {
					callback(error, results);
				})
			}
		], function(error, results) {
			expect(results).to.exist;
			done();
		})
	})

	it('should increase the version number', function(done) {
		async.waterfall([

			function(callback) {
				var testModel = new TestModel();
				testModel.testField1 = 'Hello world';
				testModel.testField2 = 42;
				testModel.save(function(error, results) {
					callback(error, results);
				});
			},
			function(results, callback) {
				results.testField1 = 'Goodbye world';
				results.save(function(error, results) {
					callback(error, results);
				});
			}
		], function(error, results) {
			expect(results.versionNumber == 2).to.be.true;
			done();
		})
	});

	it('should have related deltas', function(done) {
		var testModel;

		async.waterfall([

			function(callback) {
				var testModel = new TestModel();
				testModel.testField1 = 'Hello world';
				testModel.testField2 = 42;
				testModel.save(function(error, results) {
					callback(error, results);
				});
			},
			function(results, callback) {
				results.testField1 = 'Goodbye world';
				results.save(function(error, results) {
					callback(error, results);
				});
			},
			function(results, callback) {
				results.testField2 = 43;
				results.save(function(error, results) {
					testModel = results;
					callback(error, results);
				})
			},
			function(results, callback) {
				DeltaModel.findOne({
					_id: testModel.delta
				}, function(error, results) {
					callback(error, results);
				})
			},
			function(results, callback) {
				expect(results).to.exist;
				DeltaModel.findOne({
					_id: results.previousDelta
				}, function(error, results) {
					callback(error, results);
				})
			}
		], function(error, results) {
			expect(results).to.exist;
			done();
		})
	})


	it('should have a getVersion method on the model', function() {
		var testModel = new TestModel();
		expect(testModel).to.respondTo('getVersion');
	});

	it('shoould properly restore old versions', function(done) {
		var testModel;
		var originalTestField1 = 'Hello world';
		var originalTestField2 = 42;
		var targetVersionNumber = 1;

		async.waterfall([
			function(callback) {
				var testModel = new TestModel();
				testModel.testField1 = originalTestField1;
				testModel.testField2 = originalTestField2;
				testModel.save(function(error, results) {
					callback(error, results);
				});
			},
			function(results, callback) {
				results.testField1 = 'Goodbye world';
				results.save(function(error, results) {
					callback(error, results);
				});
			},
			function(results, callback) {
				results.testField2 = 43;
				results.save(function(error, results) {
					testModel = results;
					callback(error, results);
				})
			},
			function(results, callback) {
				results.getVersion(targetVersionNumber, function(error, results) {
					callback(error, results);
				});
			}
		], function(error, results) {
			expect(results.testField1).to.equal(originalTestField1);
			expect(results.testField2).to.equal(originalTestField2);
			done();
		})
	})
});