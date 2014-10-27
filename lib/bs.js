var model = require('./templates/model.js');
var controller = require('./templates/controller.js');
var fs = require('fs');

var run = function(arguments) {
	var name = arguments[1];

	var toCamelCase = function(inputString) {
		var lowerCase = inputString.toLowerCase();
		var words = lowerCase.split('_');
		for (var i = 0; i < words.length; i++) {
			words[i] = words[i].substr(0, 1).toUpperCase() + words[i].substr(1).toLowerCase();
		}

		return words.join("");
	}

	var writeFile = function(fileName, string) {
		if (string && string.length > 0) {
			console.log("Making file: " + fileName);

			fs.writeFile(fileName, string, function(error) {
				if (error) {
					console.error(error);
					return;
				}

				console.log("Created file: " + fileName);
			});
		}
	}

	var type = arguments[2];
	arguments = arguments.splice(3)
	var fileName = arguments[0];

	var func = function() {};
	switch (type) {
		case 'model':
			func = model;
			fileName = "./app/models/" + fileName;
			break;
		case 'controller':
			func = controller;
			fileName = "./app/controllers/" + fileName + "_controller";
			break;
		default:
			console.error("Must include a model or controller");
	}

	arguments[0] = toCamelCase(arguments[0]);
	writeFile(fileName + ".js", func.apply(null, arguments));
}

module.exports = run;

//run(arguments);