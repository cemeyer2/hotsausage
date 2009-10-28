HotSausage.installCoreMethods();

var PersonHS = function(ssn){
	var purse = this.enablePrivacy();
	purse.ssn = ssn;
};
PersonHS.privilegedMethod("getSSN", function(){return this.ssn;});
HotSausage.lock();


var PersonClosure = function(ssn){
	this.getSSN = function(){return ssn;};
};

var PersonVar = function(ssn){
	this._pp = {};
	this._pp.ssn = ssn;
};

PersonVar.prototype.getSSN = function(){return this._pp.ssn;};

var iterations = 250000;

document.write("constructing:<br/>");
var now = new Date().getTime();
for(var i = 0; i < iterations; i++){
	var person = new PersonHS("123-45-6789");
}
var then = new Date().getTime();
document.write("HS: "+(then-now)+" ms<br/>");

now = new Date().getTime();
for(i = 0; i < iterations; i++){
	person = new PersonClosure("123-45-6789");
}
then = new Date().getTime();
document.write("Closure: "+(then-now)+" ms<br/>");

now = new Date().getTime();
for(i = 0; i < iterations; i++){
	person = new PersonVar("123-45-6789");
}
then = new Date().getTime();
document.write("Var: "+(then-now)+" ms<br/>");

document.write("<br/><br/>");
document.write("accessing properties:<br/>");
var now = new Date().getTime();
var person = new PersonHS("123-45-6789");
for(var i = 0; i < iterations; i++){
	person.getSSN();
}
var then = new Date().getTime();
document.write("HS: "+(then-now)+" ms<br/>");

now = new Date().getTime();
person = new PersonClosure("123-45-6789");
for(i = 0; i < iterations; i++){
	person.getSSN();
}
then = new Date().getTime();
document.write("Closure: "+(then-now)+" ms<br/>");

now = new Date().getTime();
person = new PersonVar("123-45-6789");
for(i = 0; i < iterations; i++){
	person.getSSN();
}
then = new Date().getTime();
document.write("Var: "+(then-now)+" ms<br/>");