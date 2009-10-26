use strict;

Person = function (name, age, sex) {
	var protectedProperties = HotSausage.Priviledged.enableOn(this);
	protectedProperties._name = name;
	protectedProperties._age = age;
	protectedProperties._sex = sex;
};
