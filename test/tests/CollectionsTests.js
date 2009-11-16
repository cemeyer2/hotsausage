describe('Collections module test suite', function () {
	var direction, signValue, equalValues, public_equalValues;
	HotSausage.Collections.extend(function (Collection, _Collection_HS) {
		signValue = _Collection_HS.signValue;
		equalValues = _Collection_HS.equalValues;
		public_equalValues = Collection.equalValues;
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
	
	it('should have a module and purse method named "equalValues"', function () {
		expect(typeof equalValues === "function").toBe(true);
		expect(typeof public_equalValues === "function").toBe(true);
	});
	
	it('equalValues() should answer whether two numbers, including 0 & -0, are equal', function () {
		expect( equalValues(1, 1) ).toBe( true );
		expect( equalValues(-1, -1) ).toBe( true );
		expect( equalValues(1, -1) ).toBe( false );
		expect( equalValues(0, 0) ).toBe( true );
		expect( equalValues(-0, -0) ).toBe( true );
		expect( equalValues(0, -0) ).toBe( false );
		expect( equalValues(-0, 0) ).toBe( false );
	});
});