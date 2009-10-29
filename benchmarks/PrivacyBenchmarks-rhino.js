load("rhino/env.js");
load("../hotsausage/HotSausage.js");
load("../hotsausage/Privacy.js");

HotSausage.installCoreMethods();

var PersonHS = function(ssn){
	var purse = this.enablePrivacy();
	purse.ssn = ssn;
};
PersonHS.privilegedMethod("getSSN", function(){return this.ssn;});
HotSausage.lock();


var PersonClosure = function(ssn, a, b, c){
	this.getSSN = function(){return ssn;};
	this.getA = function(){return a;};
	this.getB = function(){return b;};
	this.getC = function(){return c;};
};

var PersonVar = function(ssn){
	this._pp = {};
	this._pp.ssn = ssn;
};

PersonVar.prototype.getSSN = function(){return this._pp.ssn;};

var iterations = 15000;

//move the accessing to a function to try to limit engine optimization
var accessor = function(p){
	p.getSSN();
};

java.lang.System.out.println("constructing:");
var now = new Date().getTime();
for(var i = 0; i < iterations; i++){
	var person = new PersonHS("123-45-6789");
}
var then = new Date().getTime();
java.lang.System.out.println("HS: "+(then-now)+" ms");

now = new Date().getTime();
for(i = 0; i < iterations; i++){
	person = new PersonClosure("123-45-6789");
}
then = new Date().getTime();
java.lang.System.out.println("Closure: "+(then-now)+" ms");

now = new Date().getTime();
for(i = 0; i < iterations; i++){
	person = new PersonVar("123-45-6789");
}
then = new Date().getTime();
java.lang.System.out.println("Var: "+(then-now)+" ms");

java.lang.System.out.println("\n\naccessing properties:");
var now = new Date().getTime();
var person = new PersonHS("123-45-6789");
for(var i = 0; i < iterations; i++){
	accessor(person);
}
var then = new Date().getTime();
java.lang.System.out.println("HS: "+(then-now)+" ms");

now = new Date().getTime();
person = new PersonClosure("123-45-6789");
for(i = 0; i < iterations; i++){
	accessor(person);
}
then = new Date().getTime();
java.lang.System.out.println("Closure: "+(then-now)+" ms");

now = new Date().getTime();
person = new PersonVar("123-45-6789");
for(i = 0; i < iterations; i++){
	accessor(person);
}
then = new Date().getTime();
java.lang.System.out.println("Var: "+(then-now)+" ms");