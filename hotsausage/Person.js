use strict;

Person = function (_name, _age, _sex) {
	var purse = HotSausage.Privacy.enableOn(this);
	purse._name = _name;
	purse._age = _age;
	purse._sex = _sex;
};
