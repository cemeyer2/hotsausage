"use strict";

/*jslint undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */

HotSausage.newSubmodule("Collections", function (Collections, _Collections_HS) {
	_Collections_HS.signValue = function (value) {
		if (value === 0) {return (1 / value > 0) ? 1 : -1;}
		return (value > 0) ? 1 : -1;
	};
	
	_Collections_HS.equalValues = function (numberA, numberB) {
		if (numberA !== numberB) {return false;}
		if (numberA !== 0) {return true;}
		return (1 / numberA) === (1 / numberB )
	};
	
	Collections.equalValues = _Collections_HS.equalValues;
});
