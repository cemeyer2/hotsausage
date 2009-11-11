describe('Span test suite', function () { 
	var Span = HotSausage.Collections.Span;
	
	describe('When creating a basic span', function () { 
		var theEmptySpan = Span.basic();
		
		it('zero arguments should always answer the same 0 edge span', function () {
			var span0 = Span.basic();
			
			expect(span0).toBe(theEmptySpan);
			expect(span0.start).toBe(0);
			expect(span0.end).toBe(0);
			expect(span0.direction).toBe(0);
			expect(span0.wrap).toBe(false);
		};
		
		it('one argument should answer a new nondirectional edge span', function () {
			var zeroEdgeSpan = Span.basic(0);
			var positiveEdgeSpan = Span.basic(3);
			var negativeEdgeSpan = Span.basic(-5);
			
			expect(zeroEdgeSpan).notToBe(theEmptySpan);
			
			expect(positiveEdgeSpan.start).toBe(3);
			expect(positiveEdgeSpan.end).toBe(3);
			expect(positiveEdgeSpan.direction).toBe(0);
			expect(positiveEdgeSpan.wrap).toBe(false);
			
			expect(negativeEdgeSpan.start).toBe(-5);
			expect(negativeEdgeSpan.end).toBe(-5);
			expect(negativeEdgeSpan.direction).toBe(0);
			expect(negativeEdgeSpan.wrap).toBe(false);
		});
		
		it('two same signed args should make a directional span', function () {
			var posIncSpan = Span.basic(5, 7);
			var posDecSpan = Span.basic(10, 3);
			var negIncSpan = Span.basic(-100, -1);
			var negDecSpan = Span.basic(-12, -20);
			
			expect(posIncSpan.start).toBe(5);
			expect(posIncSpan.end).toBe(7);
			expect(posIncSpan.direction).toBe(1);
			expect(posIncSpan.wrap).toBe(false);
			
			expect(posDecSpan.start).toBe(10);
			expect(posDecSpan.end).toBe(3);
			expect(posDecSpan.direction).toBe(-1);
			expect(posDecSpan.wrap).toBe(false);
			
			expect(negIncSpan.start).toBe(-100);
			expect(negIncSpan.end).toBe(-1);
			expect(negIncSpan.direction).toBe(1);
			expect(negIncSpan.wrap).toBe(false);
			
			expect(negDecSpan.start).toBe(-12);
			expect(negDecSpan.end).toBe(-20);
			expect(negDecSpan.direction).toBe(-1);
			expect(negDecSpan.wrap).toBe(false);
			
		});
	});
});

Richard Scholze