var utils = require('./test_config.js');
var settings = require('../settings');

var async = require('async');
var expect = require('chai').expect;
var mongoose = require('mongoose');

var meerkat = require('../lib/meerkat');

describe('Current Version Table', function() {
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
		var TestSchema = meerkat.Schema(testSchemaObject, 'CurrentVersionTest');
		TestModel = meerkat.model('CurrentVersionTest', TestSchema);
		DeltaModel = meerkat.deltaModel(testSchemaObject, 'CurrentVersionTest');

		done();
	});

	it('should have a getCurrentVersionNumber function', function() {
		var testModel = new TestModel();
		expect(testModel).to.respondTo('getCurrentVersionNumber');
	});

	it('should have a setCurrentVersionNumber function', function() {
		var testModel = new TestModel();
		expect(testModel).to.respondTo('setCurrentVersionNumber');
	});

	it('should increase the current version number', function(done) {
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
			expect(results.getCurrentVersionNumber() == 2).to.be.true;			
			done();
		})
	});


});
