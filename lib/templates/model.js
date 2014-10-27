var header = "var settings = require('../../settings');\n";
header += "var mongoose = require('mongoose')\n";

module.exports = function(name) {
	var modelName = name;

	var fileString = header;
	fileString += "var " + modelName + "Schema = mongoose.Schema({\n"
	for (var i = 1; i < arguments.length; i++) {
		var model = arguments[i].split(":");
		var field = model[0];
		var type = model[1];

		fileString += "\t" + field + ": {\n";
		fileString += "\t\ttype: " + type + "\n"
		fileString += "\t},\n\n"
	}

	fileString += "}\n\n";
	fileString += "var " + modelName + " = mongoose.model('" + modelName + "', " + modelName + "Schema);\n";
	fileString += "module.exports = " + modelName + ";\n"

	return fileString;
}