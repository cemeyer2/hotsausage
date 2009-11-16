describe('Span test suite', function () { 
	var Span = HotSausage.Collections.Span;
	var equalValues = HotSausage.Collections.equalValues;
	var FWD = 1;
	var NON = 0;
	var BWD = -1;
	
	var _checkSpanProperties = function (span, wraps, start, end, direction, impliedDirection_) {
		var impliedDirection = (arguments.length === 5) ? direction : impliedDirection_;
		expect(span.wraps).toBe(wraps);
		expect( equalValues(span.start, start) ).toBe(true);
		expect( equalValues(span.end, end) ).toBe(true);
		expect(span.direction).toBe(direction);
		expect(span.impliedDirection).toBe(impliedDirection);
	};
	
	describe('When creating a basic span', function () { 
		var theEmptySpan = Span.empty();
		
		describe('When using 0 params', function () {
			it('should always answer the canonical basic span', function () {
				var span = Span.basic();
				expect(span).toBe(theEmptySpan);
				expect( span.isSameAs(Span.edge(0)) ).toBe( true );
				_checkSpanProperties(span, false, 0, 0, NON);
			});
		});
		
		describe('When using 1 params', function () {
			it('should answer a new edge span', function () {
				expect( Span.basic(0).isSameAs(theEmptySpan) ).toBe( true );
				expect( Span.basic(0) ).toNotBe( theEmptySpan );
				expect( Span.basic(3).isSameAs(Span.edge(3)) ).toBe( true );
				_checkSpanProperties( Span.basic(3), false, 3, 3, NON );
				_checkSpanProperties( Span.basic(-5), false, -5, -5, NON );
			});
			
			it('using -0 should be different from using 0', function () {
				expect( Span.basic(-0).isSameAs( Span.basic(0) )).toBe( false );
			});
		});
		
		describe('When using 2 params', function () {
			it('should be the same as an single edge when both edges are the same', function () {
				expect( Span.basic(5, 5).isSameAs( Span.edge(5) )).toBe( true );
				expect( Span.basic(-0, -0).isSameAs( Span.edge(-0) )).toBe( true );
			});
			
			it('using -0 should be different from using 0', function () {
				expect( Span.basic(-0, -0).isSameAs( Span.edge(0) )).toBe( false );
				expect( Span.basic(-0, -0).isSameAs( Span.basic(0, 0) )).toBe( false );
				expect( Span.basic(0, -0).isSameAs( Span.basic(0, 0) )).toBe( false );
				expect( Span.basic(0, -0).isSameAs( Span.basic(-0, 0) )).toBe( false );
			});
			
			it('should be forward direction when increasing', function () {
				_checkSpanProperties( Span.basic(5, 7), false, 5, 7, FWD );
				_checkSpanProperties( Span.basic(-100, -1), false, -100, -1, FWD );
			});
			
			it('should be backward direction when decreasing', function () {
				_checkSpanProperties( Span.basic(10, 3), false, 10, 3, BWD );
				_checkSpanProperties( Span.basic(-12, -20), false, -12, -20, BWD );				
			});
			
			it('should be nondirectional when the args are the same but non zero', function () {
				_checkSpanProperties( Span.basic(10, 10), false, 10, 10, NON );
				_checkSpanProperties( Span.basic(-3, -3), false, -3, -3, NON );
			});
			
			it('should be able to set the direction of spans beginning or ending with 0/-0', function () {
				_checkSpanProperties( Span.basic(0, 0), false, 0, 0, NON );		
				_checkSpanProperties( Span.basic(0, -0), false, 0, -0, FWD );		
				_checkSpanProperties( Span.basic(0, 3), false, 0, 3, FWD );	
				_checkSpanProperties( Span.basic(0, -3), false, 0, -3, FWD );	
				_checkSpanProperties( Span.basic(-0, -0), false, -0, -0, NON );			
				_checkSpanProperties( Span.basic(-0, 0), false, -0, 0, BWD );
				_checkSpanProperties( Span.basic(-0, 3), false, -0, 3, BWD );
				_checkSpanProperties( Span.basic(-0, -3), false, -0, -3, BWD );
				_checkSpanProperties( Span.basic(3, 0), false, 3, 0, BWD );
				_checkSpanProperties( Span.basic(-3, 0), false, -3, 0, BWD );
				_checkSpanProperties( Span.basic(3, 0), false, 3, 0, BWD );
			});
			
			it('should be of undefined direction when the args are of opposite sign, but non-zero', function () {
				_checkSpanProperties( Span.basic(5, -3), false, 5, -3, undefined );		
				_checkSpanProperties( Span.basic(-5, 3), false, -5, 3, undefined );		
			});
		});
	});

	describe('When creating an incrementing span', function () { 
		describe('When using 0 params', function () {
			it('should always answer a newforward nonwrapping 0 edge', function () {
				var span = Span.inc();
				expect( span.isSameAs(Span.inc()) ).toBe(true);
				expect( span === Span.inc() ).toBe(false);
				expect( span.isSameAs(Span.edge(0)) ).toBe( false );
				
				_checkSpanProperties(span, false, 0, 0, FWD, NON);
			});
		});
		
		describe('When using 1 params', function () {
			it('should answer a standard inc span span', function () {
				expect( Span.inc(0).isSameAs(Span.inc()) ).toBe( true );
				
				_checkSpanProperties( Span.inc(3), false, 3, 3, FWD, NON );
				_checkSpanProperties( Span.inc(-5), false, -5, -5, FWD, NON );
			});
			
			it('using -0 should be different from using 0', function () {
				expect( Span.inc(-0).isSameAs( Span.inc(0) )).toBe( false );
			});
		});
		
		describe('When using 2 edge params', function () {
			it('should be forward implied direction when increasing', function () {
				_checkSpanProperties( Span.inc(5, 7), false, 5, 7, FWD, FWD );
				_checkSpanProperties( Span.inc(-100, -1), false, -100, -1, FWD, FWD );
			});
			
			it('should be backward implied direction when decreasing', function () {
				_checkSpanProperties( Span.inc(10, 3), false, 10, 3, FWD, BWD );
				_checkSpanProperties( Span.inc(-12, -20), false, -12, -20, FWD, BWD );				
			});
			
			it('should be implied nondirectional when the args are the exactly the same', function () {
				_checkSpanProperties( Span.inc(10, 10), false, 10, 10, FWD, NON );
				_checkSpanProperties( Span.inc(0, 0), false, 0, 0, FWD, NON );
				_checkSpanProperties( Span.inc(-3, -3), false, -3, -3, FWD, NON );
			});
			
			it('should be of undefined direction when the args are of opposite sign, but non-zero', function () {
				_checkSpanProperties( Span.inc(5, -3), false, 5, -3, FWD, undefined );		
				_checkSpanProperties( Span.inc(-5, 3), false, -5, 3, FWD, undefined );		
			});
		});
		
		describe('When using the wraps param', function () {
			it('should be same as not using it when wraps is false', function () {
				expect( Span.inc(5, false).isSameAs(Span.inc(5)) ).toBe( true );
				expect( Span.inc(-0, false).isSameAs(Span.inc(-0)) ).toBe( true );
				expect( Span.inc(5, 7, false).isSameAs(Span.inc(5, 7)) ).toBe( true );
				expect( Span.inc(-100, -1, false).isSameAs(Span.inc(-100, -1)) ).toBe( true );
				expect( Span.inc(-1, 1, false).isSameAs(Span.inc(-1, 1)) ).toBe( true );		
			});
			
			it('should be set to true when wraps is true', function () {
				_checkSpanProperties( Span.inc(5, 7, true), true, 5, 7, FWD, FWD );
				_checkSpanProperties( Span.inc(-100, -1, true), true, -100, -1, FWD, FWD );
			});
			
			it('should not cause clamping when implied direction is decreasing', function () {
				_checkSpanProperties( Span.inc(10, 3, true), true, 10, 3, FWD, BWD );
				_checkSpanProperties( Span.inc(-12, -20, true), true, -12, -20, FWD, BWD );				
			});
			
			it('should be implied nondirectional when using one edge arg', function () {
				_checkSpanProperties( Span.inc(10, true), true, 10, 10, FWD, NON );
				_checkSpanProperties( Span.inc(0, true), true, 0, 0, FWD, NON );
				_checkSpanProperties( Span.inc(-3, true), true, -3, -3, FWD, NON );
			});
			
			it('should be implied nondirectional when the args are the exactly the same', function () {
				_checkSpanProperties( Span.inc(10, 10, true), true, 10, 10, FWD, NON );
				_checkSpanProperties( Span.inc(0, 0, true), true, 0, 0, FWD, NON );
				_checkSpanProperties( Span.inc(-3, -3, true), true, -3, -3, FWD, NON );
			});
			
			it('should be of undefined direction when the args are of opposite sign, but non-zero', function () {
				_checkSpanProperties( Span.inc(5, -3, true), true, 5, -3, FWD, undefined );		
				_checkSpanProperties( Span.inc(-5, 3, true), true, -5, 3, FWD, undefined );		
			});
		});
	});
});

/*	
	describe('When creating a incrementing span', function () { 
		describe('When using 0 params', function () {
			it('should answer a new incrementing nonwrapping 0 edge span', function () {
				_checkSpanProperties( Span.inc(), 0, 0, 1, false );
				_checkSpanProperties( Span.dec(), 0, 0, -1, false );			
			};
		};
		
		describe('When using 1 params', function () {
			it('should answer a new incrementing nonwrapping edge span', function () {
				_checkSpanProperties( Span.inc(-5), -5, -5, 1, false );
				_checkSpanProperties( Span.inc(6), 6, 6, -1, false );						
			};
		};
		
		describe('When using 2 number params', function () {
			describe('When params are the same sign value', function () {
				describe('When the start <= end', function () {
					it('should set the start and end as expected', function () {
						_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
						_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	
					
						_checkSpanProperties( Span.inc(-0, -0), 0, 0, 1, false );
						_checkSpanProperties( Span.inc(5, 5), 5, 5, 1, false );
					});
				});
				
				describe('When the start > end', function () {
					it('should set the start and end as expected', function () {
						_checkSpanProperties( Span.inc(2, 1), 2, 2, 1, false );
						_checkSpanProperties( Span.inc(-1, -3), -1, -1, 1, false );	
					});
				});
			});
			
			describe('When params are the same direction', function () {
				it('should set the start and end as expected', function () {
					_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
					_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	
					
					_checkSpanProperties( Span.inc(-0, -0), 0, 0, 1, false );
					_checkSpanProperties( Span.inc(5, 5), 5, 5, 1, false );
				};
			};
			
			
			it('should answer a new clamped nonwrapping span', function () {
				_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
				_checkSpanProperties( Span.inc(9, 3), 9, 9, 1, false );
				_checkSpanProperties( Span.inc(-4, -12), -4, -4, 1, false );
				_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	

				_checkSpanProperties( Span.dec(1, 2), 1, 1, -1, false );
				_checkSpanProperties( Span.dec(9, 3), 9, 3, -1, false );
				_checkSpanProperties( Span.dec(-4, -12), -4, -12, -1, false );
				_checkSpanProperties( Span.dec(-3, -1), -3, -3, -1, false );					
			};
		};
		
		describe('When the optional wrapping param is false', function () {
			it('should answer exactly the same as without it', function () {
				_checkSpanProperties( Span.inc(-5), -5, -5, 1, false );
				_checkSpanProperties( Span.dec(1), 1, 1, -1, false );
				
				expect( Span.inc(-5).isSameAs( Span.inc(-5, false) )).toBe(true);
				expect( Span.dec(1).isSameAs( Span.dec(1, false) )).toBe(true);
				
				expect( Span.dec(1, 2).isSameAs( Span.dec(1, 2, false) )).toBe(true);
				expect( Span.inc(1, 2).isSameAs( Span.inc(1, 2, false) )).toBe(true);
				expect( Span.dec(1, 2).isSameAs( Span.dec(1, 2, false) )).toBe(true);
				expect( Span.inc(1, 2).isSameAs( Span.inc(1, 2, false) )).toBe(true);
				
				_checkSpanProperties( Span.inc(1, 2), 1, 2, 1, false );
				_checkSpanProperties( Span.inc(9, 3), 9, 9, 1, false );
				_checkSpanProperties( Span.inc(-4, -12), -4, -4, 1, false );
				_checkSpanProperties( Span.inc(-3, -1), -3, -1, 1, false );	

				_checkSpanProperties( Span.dec(1, 2), 1, 1, -1, false );
				_checkSpanProperties( Span.dec(9, 3), 9, 3, -1, false );
				_checkSpanProperties( Span.dec(-4, -12), -4, -12, -1, false );
				_checkSpanProperties( Span.dec(-3, -1), -3, -3, -1, false );					
			};
		};
		
	});
});
*/