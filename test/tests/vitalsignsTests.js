describe("vitalsign test suite", function(){
	
	var now;	
	var data;
	var sensor1;
	/*
	 * JSON Layout for this vital sign:<br><br>
	 * obj.type - String<br>
	 * obj.measurementType - String<br>
	 * obj.heartRate - Number<br>
	 * obj.oxygenSaturationPercentage - Number<br>
	 * obj.disconnected - boolean<br>
	 * obj.outOfTrack - boolean<br>
	 * obj.artifact - boolean<br>
	 * obj.marginalPerfusion - boolean<br>
	 * obj.lowPerfusion - boolean<br>
	 * obj.fromValidSensor - boolean<br>
	 */
	
	beforeEach(function(){
		now = new Date();
		condition = new mdpnp.rules.LessThanCondition(50);
		data = {
			'measurementTime': now,
			
			'type': 'PulseOximeter',
			'measurementType': 'heartrate',
			'heartRate': 78,
			'oxygenSaturationPercentage': 98,
			'disconnected': false,
			'outOfTrack': false,
			'artifact': false,
			'marginalPerfusion': false,
			'lowPerfusion': false,
			'fromValidSensor': false
		};
		sensor1 = new mdpnp.SPO2VitalSign(data, 'sensor1')
		
	});
	
	it('should be able to get information from a vital sign', function(){	
		expect(sensor1.getData()).toEqual(data);
		expect(sensor1.getType()).toEqual('PulseOximeter');
		expect(sensor1.getFrom()).toEqual('sensor1');
		expect(sensor1.getTimestamp()).toEqual(now);
		
		
	});
	
	
});

describe("vitalsigns test suite", function(){
	
	var now;	
	var data;
	var sensor1;
	var vitals;
	/*
	 * JSON Layout for this vital sign:<br><br>
	 * obj.type - String<br>
	 * obj.measurementType - String<br>
	 * obj.heartRate - Number<br>
	 * obj.oxygenSaturationPercentage - Number<br>
	 * obj.disconnected - boolean<br>
	 * obj.outOfTrack - boolean<br>
	 * obj.artifact - boolean<br>
	 * obj.marginalPerfusion - boolean<br>
	 * obj.lowPerfusion - boolean<br>
	 * obj.fromValidSensor - boolean<br>
	 */
	
	beforeEach(function(){
		now = new Date();
		condition = new mdpnp.rules.LessThanCondition(50);
		data = {
			'measurementTime': now,
			
			'type': 'PulseOximeter',
			'measurementType': 'heartrate',
			'heartRate': 78,
			'oxygenSaturationPercentage': 98,
			'disconnected': false,
			'outOfTrack': false,
			'artifact': false,
			'marginalPerfusion': false,
			'lowPerfusion': false,
			'fromValidSensor': false
		};
		sensor1 = new mdpnp.SPO2VitalSign(data, 'sensor1')
		vitals = new mdpnp.VitalSigns();
		vitals.addVitalSign(sensor1);
		
	});
	
	it('should be able to get vitalsigns and their types', function(){	
		expect(vitals.getVitalSigns('PulseOximeter')[0]).toEqual(sensor1);
		expect(vitals.getAvailableTypes()[0]).toEqual('PulseOximeter');
		
		
		
	});
	
	
});