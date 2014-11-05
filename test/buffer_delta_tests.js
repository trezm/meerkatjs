var meerkat = require('../lib/meerkat');
var expect = require('chai').expect;

describe('Buffer Deltas', function() {
	var moreRecent = "test 2";
	var lessRecent = "test1"

	it('should respond to calculateDelta', function() {
		expect(meerkat).to.respondTo('calculateDelta');
	});

	it('should respond to applyDelta', function() {
		expect(meerkat).to.respondTo('applyDelta');
	});

	it('should create a delta of the same length as less recent', function() {		
		expect(meerkat.calculateDelta(moreRecent, lessRecent).length).to.equal(lessRecent.length);
	});

	it('should yield the correct results after a single diff', function() {
		var diff = meerkat.calculateDelta(moreRecent, lessRecent);

		expect(meerkat.applyDelta(moreRecent, diff)).to.equal(lessRecent);
	});

	it('should correctly apply to a long history', function() {
		var first = "first";
		var second = "second";
		var third = "third";
		var fourth = "fourth";
		var fifth = "fifth";

		var firstSecondDiff = meerkat.calculateDelta(second, first);
		var secondThirdDiff = meerkat.calculateDelta(third, second);
		var thirdFourthDiff = meerkat.calculateDelta(fourth, third);
		var fourthFifthDiff = meerkat.calculateDelta(fifth, fourth);

		// Apply
		var fourthPostDiff = meerkat.applyDelta(fifth, fourthFifthDiff);
		var thirdPostDiff = meerkat.applyDelta(fourthPostDiff, thirdFourthDiff);
		var secondPostDiff = meerkat.applyDelta(thirdPostDiff, secondThirdDiff);
		var firstPostDiff = meerkat.applyDelta(secondPostDiff, firstSecondDiff);

		expect(fourthPostDiff).to.equal(fourth);
		expect(thirdPostDiff).to.equal(third);
		expect(secondPostDiff).to.equal(second);
		expect(firstPostDiff).to.equal(first);
	})
})