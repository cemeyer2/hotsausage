

Priviledged.Examples = {};

Priviledged.Examples.Person = (function () {
	var Person = function (name) {
		var purse = Priviledged.attachPurse(this);
		var pair = KeyGenerator.newPair();
		purse.name = name;
		purse.favoritePassword = 'abc123';
		purse.secretLover = 'Gumby';
		purse.privateKey = pair.privateKey;
		purse.publickey = pair.publicKey;
	};
	
	Priviledged.methodOn(Person, "publicKey")
})();

Priviledged.Examples.Person

Priviledged.setMethod = _setMethod;
Priviledged.attachPurse = _attachPurse;

	
	Priviledged.enableUseFromCore();
	Priviledged.handleErrorsQuietly();
	
	Thingy = function (name) {
		var purse = this.enablePurse();
		purse.secretCode = "ABC123";
		purse.ssn = "344-55-6677";
		purse.batPhoneNumber = "312-234-5678";
	};
	
	Thingy.priviledgedMethod("didTheyCall", function (phoneNumber) {
		return this.batPhoneNumber === phoneNumber;
	});
	
	Priviledged.onImproperPurse = function (target, actualPurseOwner) {
		if (_handleErrorsQuietly) {return target;}
		var error = new Error("Another object's purse has been attached to the target object!");
		error.name = "ImproperPurse";
		throw error;
	}
	Priviledged.lock();
	
