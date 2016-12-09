///
// Dependencies
///

const Promise = require('bluebird');
const _ = require('lodash');


///
// Configuration
///

const allUsers = [{
	name: 'Administrator',
	username: 'admin',
	email: 'admin@example.com',
	password: 'Some password',
}];


///
// Main
///

module.exports = function initUsers(app) {
	const Person = app.models.person;

	(getNewUsers({})
		.then(addNewUsers)
		.catch(handleError)
	);


	///
	// Helpers
	///

	function getNewUsers(scope) {
		const emails = _.map(allUsers, 'email');

		return Person.find({where: {email: {inq: emails}}}).then(existingUsers => {
			const existingEmails = _.map(existingUsers, 'email');
			const newUsers = _.reject(allUsers, (user) => (
				_.includes(existingEmails, user.email)
			));

			scope = _.assign({}, scope, {newUsers});

		}).then(() => scope);
	}

	function addNewUsers(scope) {
		const promises = [];
		scope.newUsers.map(newUser => {
			promises.push(new Promise((resolve, reject) => {
				Person.create(newUser, (err, addedUser) => {
					if(err) {
						return reject(err);
					} else {
						return resolve(addedUser);
					}
				});
			}));
		});

		Promise.all(promises).then(addedUsers => {
			scope = _.assign({}, scope, {newUsers: addedUsers});
		}).then(() => scope);
	}

	function handleError(error) {
		console.error(error);
	}
};

