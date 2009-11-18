describe('Templates test suite', function () { 
	var Templates = HotSausage.Templates;

	Templates.extend(function (Templates, _Templates_HS) {
		
	});
	
	it('should be added to HS', function () {
		expect(Templates.isModule()).toBe(true);
	});
	
	describe('When Templates is loaded', function () {
		var Clone = Templates.Clone;
		var instance0, purse, instanceBD, bootstrapBD;
		
		it('should have a function at Clone', function () {
			expect( Clone ).toBeDefined();
			expect( typeof Clone ).toBe( "function" );
		});
		
		it('should have a template object named Clone', function () {
			instance0 = Clone();
			
			expect( instance0 ).toBeDefined();
			expect( instance0.name() ).toBe( "Clone" );
			expect( instance0.template() ).toBe( null );
			expect( instance0.isTemplate() ).toBe( true );
		});
		
		it('should have a purse', function () {
			purse = instance0._purse;
			
			expect( purse ).toBeDefined();
			expect( purse._owner ).toBe( instance0 );
		});
		
		it('should have behavior data', function () {
			instanceBD = instance0._purse.__hsbd;
			
			expect( instanceBD ).toBeDefined();
			expect( instanceBD.name() ).toBe( "Clone_BD" );
		});
		
		it('should have a bootstrap behavior data object', function () {
			bootstrapBD = instance0._purse.__hsbd._delegateBD;
			
			expect( bootstrapBD ).toBeDefined();
			expect( bootstrapBD.name() ).toBe("_NULL__BD");
			expect( bootstrapBD._templateBD ).toBe( bootstrapBD );
		});
		
	});
});
	
/*	
	var templateInstance0 = (function bootstrap() {
		var bootstrapInstance = _newObject();
		var bootstrapBD = __newBehavioralData(Object.prototype, null);
		__attachPurse(bootstrapInstance, bootstrapBD);
		__ensureMethodDictionary(bootstrapBD);
		bootstrapBD.templateBD = bootstrapBD;
		bootstrapBD.template = null;
		bootstrapBD.basicName = "_NULL_";
		// This function is very similar to _newTemplate but the 
		// following functions and properties are not needed:
		//    __attachMethod_newInstance(), __copyMethods()
		//    snapshotId, delegateBD, instanceCount, snapshotCount
		bootstrapBD.name = function () {return __bdBasicName(this) + "-BD";};
		return _newTemplate(bootstrapInstance, "Clone");
	})();
*/	