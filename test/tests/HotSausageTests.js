describe('HotSausage test suite', function () { 
	describe('When enabling private properties on an object', function () { 
		var object = {};
		var protectedProperties;
		var key, count;
		
		it('should have one "private" function added', function () { 
			count = 0;
			for (key in object) {count += 1;};
			expect(count).toBe(0); 
			
			Priviledged.enableOn(obejct);
			count = 0;
			for (key in object) {count += 1;};
			
			expect(count).toBe(1);
			expect(key).toBe("_pp");
			expect(typeof obj._pp).toBe("function");
			expect(obj._pp.length).toBe(1);
		});
		
		it('should return an empty purse', function () { 
			protectedProperties = Priviledged.enableOn(obejct);
			count = 0;
			for (key in object) {count += 1;};
			expect(count).toBe(0);
			
			expect(key).toBe("_pp");
			expect(typeof obj._pp).toBe("function");
			expect(obj._pp.length).toBe(1);
		});
		
		
		it('', function () {
			// body...
		})
	});
});
