undefined
// Will speed up references to window, and allows munging its name.
window = this,
// Will speed up references to undefined, and allows munging its name.
undefined,

instanceof
for each -> https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Object/propertyIsEnumerable

CouchDB JS

ssh://hg@bitbucket.org/m3rabb/hotsausage/


// isLocalProperty isInstanceProperty
	
	
	_Eve.localAttributesAreEqual = function (that) {
		var propertyName;
		for (propertyName in this) {
			if (_notPrivateProperty(propertyName) && ) {
				if (this.hasOwnProperty(propertyName)) {
					if (! that.hasOwnProperty(propertyName)) {return false;}
					if (this[propertyName] !== that[propertyName]) {return false;}
				}
			}
		}
		return true;
	};
	

	var _copyLocalPropertiesFromTo = function (source, target) {
		var propertyName;
		for (propertyName in source) {
			if (source.hasOwnProperty(propertyName)) {
				target[propertyName] = source[propertyName];
			};
		};
	};

	var behaviorOf = function (instanceObject) {
		var behavior = _delegateOf(instanceObject);
		return checkValidBehavior(behavior);
	};

	var checkValidBehavior = function (target) {
		if (target === _SharedImplementation) { return target };
		if (_delegateOf(target) !== _SharedImplementation) {
			return outerObject.onInvalidShared(target);
		}
		return target;
	};

	var _Slice_Arguments_to_Array = Array.prototype.slice;
	
	var _arguments2Array = function (argumentsObject) {
		return _Slice_Arguments_to_Array.call(argumentsObject); 
	};


	var A = function () {
		this.count = 0;
	};
	var B = function () {};
	B.prototype = new A;

	var b1 = new B();

	alert(b1.count);

TextMate JavaScript

	function statement

function ${1:function_name} (${2:argument}) {
	${0:// body...}
}

	jasmine.Matchers.prototype.toBe = function(expected) {
	jasmine.Matchers.prototype.toNotBe = function(expected) {
	jasmine.Matchers.prototype.toEqual = function(expected) {
	jasmine.Matchers.prototype.toNotEqual = function(expected) {
	jasmine.Matchers.prototype.toMatch = function(reg_exp) {
	jasmine.Matchers.prototype.toNotMatch = function(reg_exp) {
	jasmine.Matchers.prototype.toBeDefined = function() {
	jasmine.Matchers.prototype.toBeNull = function() {
	jasmine.Matchers.prototype.toBeTruthy = function() {
	jasmine.Matchers.prototype.toBeFalsy = function() {


	jasmine.Matchers.prototype.toContain = function(item) {
	jasmine.Matchers.prototype.toNotContain = function(item) {
