HotSausage.installCoreMethods();
var construct = function(){
	var purse = this.enablePrivacy();

	purse.protecteditem = "protected item";

	this.privilegedMethod("bar", function(){
		return this.protecteditem;
	});
};
HotSausage.lock();

var foo = new construct();
alert(foo.bar());