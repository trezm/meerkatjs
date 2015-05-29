# Meerkat
### A subset of Mongoose

[ ![Codeship Status for trezm/meerkatjs](https://www.codeship.io/projects/ddee8060-4735-0132-a716-6270855257c1/status)](https://www.codeship.io/projects/45520)

Meerkat adds versioning functionality on top of Mongoose.  When changes are saved to the database, Meerkat also creates a delta between versions, and stores them as well.  This means that to recall old versions of existing data objects, all you have to do is know the version number.

### Model methods
Meerkat functions exactly like standard mongoose, but with the addition of a few fields/methods:

- `<Mongoose Object>.getVersion(version)`: retrieves the model associated with the given version
- `<Mongoose Object>.versionNumber`: The latest version number of the given model, i.e. a model with 10 versions, currently on the 5th version will return 10.
- `<Mongoose Object>.currentVersionNumber`: The current version of the object, i.e. a model with 10 versions, currently on the 5th version will return 5.

### Deltas
Meerkat stores information about changes in collections in separate tables, called Delta Collections.  When a Schema is created, it's actually split into two different schemas, a private schema, which is preceded by a `_`, i.e. `_testSchema` and a Delta schema, which is anteceded by `Delta`, i.e., `testSchemaDelta`.

Each time that a field is altered, it hits a virtual method in the resulting schema, `testSchema`, that calculates and sets the delta for that given field.

Deltas are stored between saves of objects and are not committed until right before a save is called, `testSchema.save()`.  The pre method to the save then stores the delta in the delta table, increases the currentVersionNumber if the object is currently the latest version, and increases the versionNumber.

Deltas are calculated by doing a bitwise XOR with the previous version of the field, which is fast and lossless.
 
### And...
That's about it.  Please don't hesitate to ask questions, as this library has only been used very lightly.
