describe('Collections module test suite', function () {
	var direction;
	HotSausage.Collections.extend(function (Collection, _Collection_HS) {
		direction = _Collection_HS.direction;
	};
	
	it('should be added to HS', function () {
		expect(HotSausage.Collections.isModule()).toBe(true);
	};
	
	it('should have a purse method named "direction"', function () {
		expect(typeof direction === "function").toBe(true);
	};
	
	it('direction answers the direction of number', function () {
		expect(direction(13)).toBe(1);
		expect(direction(-5)).toBe(-1);
		expect(direction(0)).toBe(1);
		expect(direction(-0)).toBe(1);
	};
};