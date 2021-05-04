
let users = {
	'xxx':'123',
	'abc':'blabla',
	'gru':'shrikingmoon',
	'andrea': 'hello!'
};

function validateUser(user,pass){
	let result = false;
	let p = users[user];
	if (p){
		if (p==pass){
			// OK
			result = true;
		}
	}	

	return result;
}

module.exports = validateUser; 