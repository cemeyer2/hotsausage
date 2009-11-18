describe('Priviledged test suite', function () { 
	describe('When HotSausage.Privacy is loaded', function () { 
		it('HotSausage.Privacy module should be accessible', function () {
			
			var priv = HotSausage.Privacy;
			
			expect(priv).toBeDefined();
			expect(priv.name()).toBe("Privacy");
			expect(priv.module()).toBe(HotSausage);
			expect(priv.newSubmodule).toBeDefined();
			expect(priv.enableOn).toBeDefined();
			expect(priv.lock).toBeDefined();
			expect(priv.privilegedMethodOn).toBeDefined();
			expect(priv.installCoreMethods).toBeDefined();
			
			priv.installCoreMethods();
			
			expect(Object.prototype.privilegedMethod).toBeDefined();
			expect(Object.prototype.enablePrivacy).toBeDefined();
			expect(Function.prototype.privilegedMethod).toBeDefined();
		});
		
		it('should be able to enable privacy on an object', function () {
			var Person = function(ssn){
				var purse = this.enablePrivacy();
				purse.ssn = ssn;
				expect(purse).toBeDefined();
				expect(purse.ssn).toBeDefined();
				expect(purse.ssn).toEqual(ssn);
			};
			expect(Person.enablePrivacy).toBeDefined();
			expect(Person.privilegedMethod).toBeDefined();
			
			var p = new Person("123-45-6789");
		});
		
		it('should be able to add a privileged method to an object', function () {
			var pp;
			
			var Person = function (ssn) {
				var purse = this.enablePrivacy();
				purse.ssn = ssn;
				pp = purse; //this is bad practice, but useful for testing
			};
			
			Person.privilegedMethod("getSSN", function () {
				expect(this).toEqual(pp);
				expect(this.ssn).toBeDefined();
				return this.ssn;
			});
			
			var ssn = "123-45-6789";
			var p = new Person(ssn);
			
			expect(p.getSSN).toBeDefined();
			expect(p.getSSN()).toEqual(ssn);
		
		});
	});
});
