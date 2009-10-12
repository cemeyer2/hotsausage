describe('List', function () { 
	var emptyList, namesArray, shortList, size; 
	
	beforeEach(function () { 
		emptyList = new List();
		namesArray = ['Maurice', 'Steve', 'Charlie'];
		arraySize = namesArray.length;
		namesList = new List(namesArray);
	}); 
	
	describe('when creating an empty list', function () { 
		it('should be empty', function () { 
			expect(emptyList.isEmpty()).toBe(true); 
			expect(emptyList.notEmpty()).toBe(false); 
			expect(emptyList.size()).toBe(0);
		}); 
	});

	describe('when creating a list from an array', function () { 
		it('should include all of the elements inorder', function () { 
			expect(namesList.isEmpty()).toBe(false); 
			expect(namesList.notEmpty()).toBe(true); 
			expect(namesList.size()).toBe(arraySize);
			expect(namesList.first().toBe(namesArray[0]));
			expect(namesList.last().toBe(namesArray[arraySize - 1]));
		}); 
	});

	describe('first', function () { 
		it('should return the first element', function () { 
			expect(namesList.first().toBe(namesArray[0]));
		}); 
		
		describe('when empty', function () { 
			it('should return nothing', function () { 
				expect(emptyList.first().toBe(undefined));
			});
		});
	});

	describe('last', function () { 
		it('should return the first element', function () { 
			expect(namesList.last().toBe(namesArray[arraySize - 1]));
		}); 

		describe('when empty', function () { 
			it('should return nothing', function () { 
				expect(emptyList.last().toBe(undefined));
			});
		});
	});
	
	describe('add & addLast', function () { 
		var element = 'Ralph';
		var result;
		
		it('should add the element to the end', function () {
			expect(namesList.last().toEqual('Charlie')); 
			result = namesList.add(element);
			expect(namesList.last().toBe(element)); 
			expect(namesList.size().toBe(arraySize + 1)); 
		});
		
		it('should return the new size', function () {
			expect(result.toBe(arraySize + 1));
		});
	});

	describe('addFirst', function () { 
		var element = 'Ralph';
		var result;
		
		it('should add the element to the end', function () {
			expect(namesList.first().toEqual('Maurice')); 
			result = namesList.addFirst(element);
			expect(namesList.first().toBe(element)); 
			expect(namesList.size().toBe(arraySize + 1)); 
		});
		
		it('should return the element', function () {
			expect(result.toBe(arraySize + 1));
		});
	});

	describe('removeFirst', function () { 
		var result;
		
		it('should remove the first element', function () {
			expect(namesList.removeFirst().toEqual('Maurice')); 
			expect(namesList.size().toBe(arraySize - 1)); 
			expect(namesList.removeAt(0, exceptionAction).toEqual('Maurice')); 
			expect(namesList.size().toBe(arraySize - 2)); 
		});

		describe('when the index is out of range', function () { 	
			it('should do nothing', function () {
				var size = namesList.size();
				expect(namesList.removeAt(100).toBe(undefined));
				expect(namesList.size().toBe(size));
			});
	});
	
	describe('removeAt', function () { 
		var result;
		var exceptionAction = function () {return 'xyz'};
		
		it('should remove the element at the index', function () {
			expect(namesList.removeAt(1).toEqual('Steve')); 
			expect(namesList.size().toBe(arraySize - 1)); 
			expect(namesList.removeAt(0, exceptionAction).toEqual('Maurice')); 
			expect(namesList.size().toBe(arraySize - 2)); 
		});
		
		describe('when the index is out of range', function () { 	
			it('should do nothing', function () {
				var size = namesList.size();
				expect(namesList.removeAt(100).toBe(undefined));
				expect(namesList.size().toBe(size));
			});
			
			describe('when using the optional outOfRangeAction', function () { 	
				it('should execute and return this action', function () {
					expect(namesList.removeAt(100, exceptionAction).toEqual('xyz')); 
					expect(namesList.removeAt(-1, exceptionAction).toEqual('xyz')); 
				});
			});
		});
	});

	describe('removeSatisfying', function () { 
		var result;
		var exceptionAction = function () {return 'xyz'};
		var condition = function (each) {return each.length === 7};
		
		it('should remove the first element which matchs the condition', function () {
			expect(namesList.removeSatisfying(condition).toEqual('Maurice')); 
			expect(namesList.size().toBe(2)); 
			expect(namesList.removeSatisfying(0, exceptionAction).toEqual('Charlie')); 
			expect(namesList.size().toBe(1)); 
			expect(namesList.first().toEqual('Steve')); 
		});
		
		describe('when the are no matchs', function () { 	
			it('should do nothing', function () {
				var size = namesList.size();
				expect(namesList.removeSatisfying(condition).toBe(undefined));
				expect(namesList.size().toBe(size));
			});
			
			describe('when using the optional absentAction', function () { 	
				it('should execute and return this action', function () {
					result = namesList.removeSatisfying(condition, exceptionAction);
					expect(result.toEqual('xyz'));
				});
			});
		});
	});

	describe('remove', function () { 
		var result;
		
		it('should remove the first identical element', function () {
			expect(namesList.remove('Steve').toBe(undefined)); 
			expect(namesList.size().toBe(arraySize)); 
			expect(namesList.remove(namesArray[1]).toEqual('Steve')); 
			expect(namesList.size().toBe(arraySize - 1)); 
		});
		
		describe('when the are no matchs', function () { 	
			it('should do nothing', function () {
				expect(emptyList.remove('something').toBe(undefined));
			});
			
			describe('when using the optional absentAction', function () { 	
				it('should execute and return this action', function () {
					result = namesList.remove('nobody', exceptionAction);
					expect(result.toEqual('xyz'));
				});
			});
		});
	});
	
	describe('doEach', function () { 
		var result, value;
		
		it('should enumerate the elements in order thru the action', function () {
			value = '';
			result = namesList.doEach(function (each) {
				value += each[0];
			});
			expect(result.toEqual('MSC')); 
		
		it('should not return a result', function () {
			expect(result.toBe(undefined));
		});

		it('should not matter if the action returns a value or not', function () {
			value = 0;
			namesList.doEach(function (each, index) {
				value += 1;
				return [undefined, null, {}][index];
			});
			expect(value.toBe(3));
		});
		
		it('should use the list itself as the context', function () {
			var answers = [];
			var abc = 'abc';
			
			namesList.i = 10;
			namesList.increment = function () {return this.i += 1};
			namesList.doEach(function (each) {
				answers.push(this.increment());
			});
			expect(answers.toEqual([11,12,13]));
		});

		describe('when the list is empty', function () { 
			it('should do nothing', function () {
				var hasExecuted = false;
				emptyList.doEach(function (each) {
					hasExecuted = true;
				});
				expect(hasExecuted.toBe(false));
			});
		});
		
		describe('when an action has two arguments', function () { 
			it('should supply the 2nd argumet with the current index', function () {
				value = 0;
				namesList.doEach(function (each, index_) {
					value += index_ * index_;
				});
				expect(value.toBe(5));
			});
		});
				
		describe('when using an optional context', function () { 
			it('should use the supplied context', function () {
				var answer = '';
				var greet = function (name) {
					this.record += (this.saying + name + '');
				};
				var doorman = {
					saying: 'hi',
					greeting: greet
				};
				
				doorman.record = '';
				namesList.doEach(greet, doorman);
				expect(doorman.record.toEqual('hi Maurice hi Steve hi Charlie '));
			});
		});
	});
	
	describe('doEachUntil', function () { 
		var result, value;

		it('should enumerate the elements in order thru the action' 
			+ 'until an action returns a defined object', function () {
			var lastIndex;
			
			result = namesList.doEachUntil(function (each, index) {
				lastIndex = index;
				return (each[0] == 'S') ? each : undefined;
			});
			expect(result.toEqual('Steve'));
			expect(lastIndex.toBe(1));
		});

		it('should use the list itself as the context', function () {
			var answers = [];
			var abc = 'abc';

			namesList.i = 10;
			namesList.increment = function () {return this.i += 1};
			result = namesList.doEachUntil(function (each) {
				answers.push(this.increment());
			});
			expect(answers.toEqual([11,12,13]));
			expect(result.toBe(undefined));
		});

		describe('when the list is empty', function () { 
			it('should do nothing', function () {
				var hasExecuted = false;
				result = emptyList.doEachUntil(function (each) {
					hasExecuted = true;
				});
				expect(hasExecuted.toBe(false));
				expect(result.toBe(undefined));
			});
		});

		describe('when an action has two arguments', function () { 
			it('should supply the 2nd argumet with the current index', function () {
				value = 0;
				namesList.doEachUntil(function (each, index_) {
					value += index_ * index_;
				});
				expect(value.toBe(5));
			});
		});

		describe('when using an optional context', function () { 
			it('should use the supplied context', function () {
				var answer = '';
				var greet = function (name) {
					this.record += (this.saying + name + '');
				};
				var doorman = {
					saying: 'hi',
					greeting: greet
				};

				doorman.record = '';
				namesList.doEachUntil(greet, doorman);
				expect(doorman.record.toEqual('hi Maurice hi Steve hi Charlie '));
			});
		});
	});
});
