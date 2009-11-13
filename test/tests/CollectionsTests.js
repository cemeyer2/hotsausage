describe('Collections module test suite', function () {
	var direction;
	HotSausage.Collections.extend(function (Collection, _Collection_HS) {
		signValue = _Collection_HS.signValue;
	});
	
	it('should be added to HS', function () {
		expect(HotSausage.Collections.isModule()).toBe(true);
	});
	
	it('should have a purse method named "signValue"', function () {
		expect(typeof signValue === "function").toBe(true);
	});
	
	it('sign() should answer the sign of a number', function () {
		expect( signValue(13) ).toBe( 1 );
		expect( signValue(-5) ).toBe( -1 );
		expect( signValue(0) ).toBe( 1 );
		expect( signValue(-0) ).toBe( -1 );
	});
});