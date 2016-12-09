///
// Dependencies
///

const Promise = require('bluebird');
const _ = require('lodash');


///
// Configuration
///

const allWidgets = [{
	name: 'Some Widget',
}];


///
// Main
///

module.exports = function initWidgets(app) {
	const Widget = app.models.widget;

	(getNewWidgets({})
		.then(addNewWidgets)
		.catch(handleError)
	);


	///
	// Helpers
	///

	function getNewWidgets(scope) {
		const names = _.map(allWidgets, 'name');

		return Widget.find({where: {name: {inq: names}}}).then(existingWidgets => {
			const existingEmails = _.map(existingWidgets, 'name');
			const newWidgets = _.reject(allWidgets, (widget) => (
				_.includes(existingEmails, widget.name)
			));

			scope = _.assign({}, scope, {newWidgets});

		}).then(() => scope);
	}

	function addNewWidgets(scope) {
		const promises = [];
		scope.newWidgets.map(newWidget => {
			promises.push(new Promise((resolve, reject) => {
				Widget.create(newWidget, (err, addedWidget) => {
					if(err) {
						return reject(err);
					} else {
						return resolve(addedWidget);
					}
				});
			}));
		});

		Promise.all(promises).then(addedWidgets => {
			scope = _.assign({}, scope, {newWidgets: addedWidgets});
		}).then(() => scope);
	}

	function handleError(error) {
		console.error(error);
	}
};

