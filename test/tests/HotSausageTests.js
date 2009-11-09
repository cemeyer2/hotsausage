describe('HotSausage test suite', function () { 
	describe('when HotSausage is loaded', function () {
		it('HotSausage module should be accessible', function () {
			expect(HotSausage).toBeDefined();
			expect(HotSausage.name()).toBe("HotSausage");
			expect(HotSausage.module()).toBe(window);
			expect(HotSausage.currentSubmodules().length).toBe(0);
			expect(HotSausage.newSubmodule).toBeDefined();
		});
		
		it('should be able to replace the name of the base "HotSausage" module', function () {
			var bmn, hs = HotSausage;
			HotSausage.renameAs("BetterModuleName");
			expect(window.HotSausage).toBe(undefined);
			bmn = window.BetterModuleName;
			expect(bmn).toBe(hs);
			expect(bmn.name()).toBe("BetterModuleName");
		});
	});
	
	describe('when making a new submodule', function () {
		var mine, hierarchicalPurse;
		var submodule = HotSausage.newSubmodule("Mine", function (Mine, _HierarchicalPurse) {
			mine = Mine;
			hierarchicalPurse = _HierarchicalPurse;
			it('should be attached', function () {
				expect();
			});
		});
		it('should be attached', function () {
			expect();
		});
	});
		
});


/*
Modules that should work with any new module not just HS

		this.name = _constantGetterFor(name);
		this.module = _constantGetterFor(parent);
		this.currentSubmodules = function () {return _submodules.slice(0);}
		this.submodulesDo = function (action) {_submodules.forEach(action);}
		this.newSubmodule = function (submoduleName, setupAction_) {
	_Module.prototype.withAllSubmodulesDo = function (action) {
	_Module.prototype.allSubmodulesDo = function (_action) {
	_Module.prototype.isModule = function () {return true;};
	_Module.prototype.renameAs = function (_name) {


		HS.isDefined = _isDefined;
		HS.constantGetterFor = _constantGetterFor;
		HS.handleError = _handleError;
		HS.methodOn = _setMethod;
		HS.isModule = function (target_) {
		HS.isUndefined = function (target) {return typeof target === UNDEFINED;};
		HS.isString = function (target) {return typeof target === STRING;};
		HS.isBoolean = function (target) {return typeof target === BOOLEAN;};
		HS.hasLocalProperty = function (target, propertyName) {
		HS.handleErrorsQuietly = function (flag) {  
		HS.respectsCore = function () {return !_HS.coreMethodsEnabled;};
		HS.installCoreMethods = function () {

		 * @name method
		HS.lock = function () {
		HS.isLocked = function () {
*/