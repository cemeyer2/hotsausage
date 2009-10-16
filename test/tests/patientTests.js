describe('patient test suite 1', function(){ 

	var steve; 
	var now; 

	beforeEach(function(){ 
		now = new Date(); //get rid of the var to make the 3rd test pass 
		steve = new mdpnp.Patient('SteveJobs', 'M', now);
	}); 

	describe('when a new patient is made', function(){ 
		it('should return a gender', function() { 
			expect(steve.getSex()).toEqual('M'); 
		}); 

		it('shoule return a patient name', function() { 
			expect(steve.getName()).toEqual('SteveJobs'); 
		})
	});
});

describe("patient test suite 2", function(){
	var patient;
	var then;
	
	beforeEach(function(){
		then = new Date();
		then.setTime(531940231963);
		patient = new mdpnp.Patient("Charlie Meyer", "M", then);
	});
	
	it('should have the name it was created with', function(){
		expect(patient.getName()).toEqual("Charlie Meyer");
	});
	
	it('should have a gender of M', function(){
		expect(patient.getSex()).toEqual("M");
	});
	
	it('should have an age of 22 years', function(){
		expect(patient.getAge()).toEqual(22);
	});
	
	it('should have a DOB equal to the DOB used to create it',function(){
		expect(patient.getDateOfBirth().toString()).toEqual(then.toString());
	});
	
	it('should have constructed a vitalsigns object', function(){
		expect(patient.getVitalSigns()).toBeDefined();
	});
});

describe("patient test suite 3", function(){
	
	it('should throw an error on invalid sex parameter', function(){
		
		var func = function(){
			var patient = new mdpnp.Patient("Name", "invalid",new Date());
		};
		expect(func).toThrow();
	});
	
	it('should throw an error on invalid dob parameter', function(){
		var func = function(){
			var patient = new mdpnp.Patient("Name","M","blah");
		};
		expect(func).toThrow();
	});
	
	it('should not throw any errors with good parameters', function(){
		var error = null;
		try{
			var patient = new mdpnp.Patient("Name","M",new Date());
		}
		catch(err){
			error = err;
		}
		expect(error).toBeNull();
	});
});

