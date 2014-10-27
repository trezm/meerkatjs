module.exports = function(name) {
	var controllerName = name;

	var fileString = "";
	fileString += "var " + controllerName + " = require('../models/" + controllerName + "');\n";
	fileString += "var mongoose = require('mongoose');\n\n";
	fileString += "module.exports." + controllerName + "Controller = {\n";
	fileString += "\tcreate: function(params, callback) {\n";
	fileString += "\t\t" + controllerName + ".create(params, callback);\n";
	fileString += "\t},\n\n";
	fileString += "\tread: function(params, callback) {\n";
	fileString += "\t\t" + controllerName + ".find(params, callback);\n";
	fileString += "\t},\n\n";
	fileString += "\tupdate: function(params, callback) {\n";
	fileString += "\t\t" + controllerName + ".update(params, callback);\n";
	fileString += "\t},\n\n";
	fileString += "\tdestroy: function(params, callback) {\n";
	fileString += "\t\t" + controllerName + ".destroy(params, callback);\n";
	fileString += "\t}\n";
	fileString += "}\n\n";
	fileString += "module.exports." + controllerName + "ControllerRoutes = {\n";
	fileString += "\tcreate: function(req, res) {\n";
	fileString += "\t},\n\n";
	fileString += "\tread: function(req, res) {\n";
	fileString += "\t},\n\n";
	fileString += "\tupdate: function(req, res) {\n";
	fileString += "\t},\n\n";
	fileString += "\tdestroy: function(req, res) {\n";
	fileString += "\t}\n";
	fileString += "}";

	return fileString;
}
